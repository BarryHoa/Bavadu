import type { InventoryCoreManagement } from "@mdl/stock/server/models/Inventory";
import { StockMoveFrom } from "@mdl/stock/server/types";
import type {
  NewSaleB2bTbDelivery,
  NewSaleB2bTbDeliveryLine,
} from "../../schemas";

import { eq } from "drizzle-orm";
import { RuntimeContext } from "@base/server/runtime/RuntimeContext";
import { BaseModel } from "@base/server/models/BaseModel";
import {
  sale_b2c_tb_order_lines,
  sale_b2c_tb_orders,
} from "@mdl/b2c-sales/server/schemas";

import {
  sale_b2b_tb_deliveries,
  sale_b2b_tb_delivery_lines,
  sale_b2b_tb_order_lines,
  sale_b2b_tb_orders,
} from "../../schemas";

export interface CreateDeliveryInput {
  orderType: "B2B" | "B2C";
  orderId: string;
  warehouseId: string;
  deliveryDate: string;
  reference?: string;
  note?: string;
  lines: Array<{
    lineId: string;
    quantity: number;
  }>;
  userId?: string;
}

export default class DeliveryModel extends BaseModel<
  typeof sale_b2b_tb_deliveries
> {
  constructor() {
    super(sale_b2b_tb_deliveries);
  }

  create = async (input: CreateDeliveryInput) => {
    const inventoryCore =
      await RuntimeContext.getModelInstanceBy<InventoryCoreManagement>("inventory-core");

    if (!inventoryCore) {
      throw new Error("Inventory core management is not registered");
    }

    // Get order to validate
    let order: any;
    let orderCode: string;

    if (input.orderType === "B2B") {
      const [b2bOrder] = await this.db
        .select()
        .from(sale_b2b_tb_orders)
        .where(eq(sale_b2b_tb_orders.id, input.orderId))
        .limit(1);

      if (!b2bOrder) {
        throw new Error("Order not found");
      }
      order = b2bOrder;
      orderCode = b2bOrder.code;
    } else {
      const [b2cOrder] = await this.db
        .select()
        .from(sale_b2c_tb_orders)
        .where(eq(sale_b2c_tb_orders.id, input.orderId))
        .limit(1);

      if (!b2cOrder) {
        throw new Error("Order not found");
      }
      order = b2cOrder;
      orderCode = b2cOrder.code;
    }

    // Get order lines
    const lineTable =
      input.orderType === "B2B"
        ? sale_b2b_tb_order_lines
        : sale_b2c_tb_order_lines;
    const orderLines = await this.db
      .select()
      .from(lineTable)
      .where(eq(lineTable.orderId, input.orderId));

    const linesById = new Map();

    for (const line of orderLines) {
      linesById.set(line.id, line);
    }

    const deliveryDate = new Date(input.deliveryDate);
    const now = new Date();

    return this.db.transaction(async (tx) => {
      // Create delivery record
      const deliveryPayload: NewSaleB2bTbDelivery = {
        orderType: input.orderType,
        orderId: input.orderId,
        warehouseId: input.warehouseId,
        deliveryDate: deliveryDate,
        reference: input.reference,
        note: input.note,
        status: "draft",
        createdBy: input.userId,
      };

      const [delivery] = await tx
        .insert(sale_b2b_tb_deliveries)
        .values(deliveryPayload)
        .returning();

      // Process delivery lines and create stock moves
      for (const deliveryLine of input.lines) {
        const orderLine = linesById.get(deliveryLine.lineId);

        if (!orderLine) {
          throw new Error(`Order line ${deliveryLine.lineId} not found`);
        }

        const quantity = Number(deliveryLine.quantity ?? 0);

        if (quantity <= 0) continue;

        const alreadyDelivered = Number(orderLine.quantityDelivered ?? 0);
        const orderedQty = Number(orderLine.quantityOrdered ?? 0);
        const nextDelivered = alreadyDelivered + quantity;

        if (nextDelivered - orderedQty > 0.0001) {
          throw new Error(
            `Cannot deliver more than ordered for product ${orderLine.productId}`,
          );
        }

        // Create delivery line
        const deliveryLinePayload: NewSaleB2bTbDeliveryLine = {
          deliveryId: delivery.id,
          orderType: input.orderType,
          orderLineId: deliveryLine.lineId,
          quantity: quantity.toString(),
        };

        await tx.insert(sale_b2b_tb_delivery_lines).values(deliveryLinePayload);

        // Update order line delivered quantity
        await tx
          .update(lineTable)
          .set({
            quantityDelivered: nextDelivered.toString(),
            updatedAt: now,
          })
          .where(eq(lineTable.id, deliveryLine.lineId));

        // Create stock move (outbound)
        await inventoryCore.issueStock({
          productId: orderLine.productId,
          warehouseId: input.warehouseId,
          quantity,
          from: input.orderType === "B2B" ? StockMoveFrom.SALES_B2B : StockMoveFrom.SALES_B2C,
          reference: input.reference || `DELIVERY:${orderCode}`,
          note: input.note,
          userId: input.userId,
        });
      }

      // Update delivery status to completed
      await tx
        .update(sale_b2b_tb_deliveries)
        .set({
          status: "completed",
          updatedAt: now,
        })
        .where(eq(sale_b2b_tb_deliveries.id, delivery.id));

      return delivery;
    });
  };
}
