import { eq } from "drizzle-orm";

import { getEnv } from "@base/server";
import { BaseModel } from "@base/server/models/BaseModel";
import {
  table_sales_order_b2b,
  table_sales_order_line_b2b,
} from "@mdl/b2b-sales/server/schemas";
import type StockModel from "@mdl/stock/server/models/Stock/StockModel";
import type {
  NewTblSalesOrderDelivery,
  NewTblSalesOrderDeliveryLine,
} from "../../schemas";
import {
  table_sales_order_b2c,
  table_sales_order_delivery,
  table_sales_order_delivery_line,
  table_sales_order_line_b2c,
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
  typeof table_sales_order_delivery
> {
  constructor() {
    super(table_sales_order_delivery);
  }

  create = async (input: CreateDeliveryInput) => {
    const env = getEnv();
    const stockModel = env.getModel("stock") as StockModel | undefined;

    if (!stockModel) {
      throw new Error("Stock model is not registered");
    }

    // Get order to validate
    let order: any;
    let orderCode: string;
    if (input.orderType === "B2B") {
      const [b2bOrder] = await this.db
        .select()
        .from(table_sales_order_b2b)
        .where(eq(table_sales_order_b2b.id, input.orderId))
        .limit(1);
      if (!b2bOrder) {
        throw new Error("Order not found");
      }
      order = b2bOrder;
      orderCode = b2bOrder.code;
    } else {
      const [b2cOrder] = await this.db
        .select()
        .from(table_sales_order_b2c)
        .where(eq(table_sales_order_b2c.id, input.orderId))
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
        ? table_sales_order_line_b2b
        : table_sales_order_line_b2c;
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
      const deliveryPayload: NewTblSalesOrderDelivery = {
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
        .insert(table_sales_order_delivery)
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
            `Cannot deliver more than ordered for product ${orderLine.productId}`
          );
        }

        // Create delivery line
        const deliveryLinePayload: NewTblSalesOrderDeliveryLine = {
          deliveryId: delivery.id,
          orderType: input.orderType,
          orderLineId: deliveryLine.lineId,
          quantity: quantity.toString(),
        };

        await tx
          .insert(table_sales_order_delivery_line)
          .values(deliveryLinePayload);

        // Update order line delivered quantity
        await tx
          .update(lineTable)
          .set({
            quantityDelivered: nextDelivered.toString(),
            updatedAt: now,
          })
          .where(eq(lineTable.id, deliveryLine.lineId));

        // Create stock move (outbound)
        await stockModel.issueStock({
          productId: orderLine.productId,
          warehouseId: input.warehouseId,
          quantity,
          reference: input.reference || `DELIVERY:${orderCode}`,
          note: input.note,
          userId: input.userId,
        });
      }

      // Update delivery status to completed
      await tx
        .update(table_sales_order_delivery)
        .set({
          status: "completed",
          updatedAt: now,
        })
        .where(eq(table_sales_order_delivery.id, delivery.id));

      return delivery;
    });
  };
}
