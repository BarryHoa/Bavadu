import type {
  NewPurchaseTbPurchaseOrder,
  PurchaseTbPurchaseOrder,
  PurchaseTbPurchaseOrderLine,
} from "../../schemas";
import type StockModel from "@mdl/stock/server/models/Stock/StockModel";

import { desc, eq, sql } from "drizzle-orm";
import { BaseModel } from "@base/server/models/BaseModel";
import { RuntimeContext } from "@base/server/runtime/RuntimeContext";

import {
  purchase_tb_purchase_orders,
  purchase_tb_purchase_orders_line,
} from "../../schemas";

type PurchaseStatus = "draft" | "confirmed" | "received" | "cancelled";

interface PurchaseOrderLineInput {
  productId: string;
  quantity: number;
  unitPrice?: number;
  description?: string;
}

interface CreatePurchaseOrderInput {
  code?: string;
  vendorName: string;
  warehouseId?: string;
  expectedDate?: string;
  currency?: string;
  notes?: string;
  lines: PurchaseOrderLineInput[];
  userId?: string;
}

interface ReceivePurchaseOrderInput {
  orderId: string;
  warehouseId?: string;
  lines: Array<{
    lineId: string;
    quantity: number;
  }>;
  reference?: string;
  note?: string;
  userId?: string;
}

export default class PurchaseOrderModel extends BaseModel<
  typeof purchase_tb_purchase_orders
> {
  constructor() {
    super(purchase_tb_purchase_orders);
  }

  list = async (): Promise<PurchaseTbPurchaseOrder[]> => {
    return this.db
      .select()
      .from(purchase_tb_purchase_orders)
      .orderBy(desc(purchase_tb_purchase_orders.createdAt));
  };

  getById = async (id: string) => {
    const [order] = await this.db
      .select()
      .from(purchase_tb_purchase_orders)
      .where(eq(purchase_tb_purchase_orders.id, id))
      .limit(1);

    if (!order) {
      return null;
    }
    const lines = await this.db
      .select()
      .from(purchase_tb_purchase_orders_line)
      .where(eq(purchase_tb_purchase_orders_line.orderId, order.id));

    return { order, lines };
  };

  create = async (input: CreatePurchaseOrderInput) => {
    if (!input.lines?.length) {
      throw new Error("Purchase order requires at least one line");
    }

    const now = new Date();
    const generatedCode =
      input.code?.trim() ||
      `PO-${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now
        .getDate()
        .toString()
        .padStart(
          2,
          "0",
        )}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return this.db.transaction(async (tx) => {
      const orderPayload: NewPurchaseTbPurchaseOrder = {
        code: generatedCode,
        vendorName: input.vendorName.trim(),
        status: "draft",
        expectedDate: input.expectedDate
          ? new Date(input.expectedDate)
          : undefined,
        warehouseId: input.warehouseId,
        currency: input.currency ?? "USD",
        notes: input.notes,
        totalAmount: "0",
        createdBy: input.userId,
      };

      const [order] = await tx
        .insert(purchase_tb_purchase_orders)
        .values(orderPayload)
        .returning();

      let totalAmount = 0;

      for (const line of input.lines) {
        const quantity = Number(line.quantity ?? 0);

        if (quantity <= 0) continue;

        const unitPrice = Number(line.unitPrice ?? 0);

        totalAmount += quantity * unitPrice;

        await tx.insert(purchase_tb_purchase_orders_line).values({
          orderId: order.id,
          productId: line.productId,
          description: line.description,
          quantityOrdered: quantity.toString(),
          quantityReceived: "0",
          unitPrice: unitPrice.toString(),
        });
      }

      await tx
        .update(purchase_tb_purchase_orders)
        .set({
          totalAmount: totalAmount.toString(),
          updatedAt: now,
        })
        .where(eq(purchase_tb_purchase_orders.id, order.id));

      const result = await this.getById(order.id);

      if (!result) {
        throw new Error("Failed to load purchase order after creation");
      }

      return result;
    });
  };

  confirm = async (orderId: string) => {
    const [updated] = await this.db
      .update(purchase_tb_purchase_orders)
      .set({
        status: "confirmed",
        updatedAt: sql`now()`,
      })
      .where(eq(purchase_tb_purchase_orders.id, orderId))
      .returning();

    if (!updated) {
      throw new Error("Purchase order not found");
    }

    return updated;
  };

  receive = async (input: ReceivePurchaseOrderInput) => {
    const stockModel =
      await RuntimeContext.getModelInstanceBy<StockModel>("stock");

    if (!stockModel) {
      throw new Error("Stock model is not registered");
    }

    const orderData = await this.getById(input.orderId);

    if (!orderData) {
      throw new Error("Purchase order not found");
    }
    const { order, lines } = orderData;

    const defaultWarehouseId =
      input.warehouseId ?? order.warehouseId ?? undefined;

    if (!defaultWarehouseId) {
      throw new Error("Warehouse is required to receive purchase order");
    }

    const linesById = new Map<string, PurchaseTbPurchaseOrderLine>();

    for (const line of lines) {
      linesById.set(line.id, line);
    }

    const now = new Date();

    await this.db.transaction(async (tx) => {
      for (const receivedLine of input.lines) {
        const line = linesById.get(receivedLine.lineId);

        if (!line) {
          throw new Error(
            `Purchase order line ${receivedLine.lineId} not found`,
          );
        }

        const receiveQty = Number(receivedLine.quantity ?? 0);

        if (receiveQty <= 0) {
          continue;
        }

        const alreadyReceived = Number(line.quantityReceived ?? 0);
        const orderedQty = Number(line.quantityOrdered ?? 0);
        const nextReceived = alreadyReceived + receiveQty;

        if (nextReceived - orderedQty > 0.0001) {
          throw new Error(
            `Cannot receive more than ordered for product ${line.productId}`,
          );
        }

        await tx
          .update(purchase_tb_purchase_orders_line)
          .set({
            quantityReceived: nextReceived.toString(),
            updatedAt: now,
          })
          .where(eq(purchase_tb_purchase_orders_line.id, line.id));

        await stockModel.receiveStock({
          productId: line.productId,
          warehouseId: defaultWarehouseId,
          quantity: receiveQty,
          reference: `PO:${order.code}`,
          note: input.note,
          userId: input.userId,
        });
      }

      const [sumRow] = await tx
        .select({
          unreceivedCount: sql`
            count(*) FILTER (
              WHERE ${purchase_tb_purchase_orders_line.quantityOrdered} > ${purchase_tb_purchase_orders_line.quantityReceived}
            )
          `,
        })
        .from(purchase_tb_purchase_orders_line)
        .where(eq(purchase_tb_purchase_orders_line.orderId, order.id));

      const status: PurchaseStatus =
        Number(sumRow?.unreceivedCount ?? 0) === 0 ? "received" : "confirmed";

      await tx
        .update(purchase_tb_purchase_orders)
        .set({
          status,
          warehouseId: defaultWarehouseId,
          updatedAt: now,
        })
        .where(eq(purchase_tb_purchase_orders.id, order.id));
    });

    return this.getById(order.id);
  };

  cancel = async (orderId: string) => {
    const [updated] = await this.db
      .update(purchase_tb_purchase_orders)
      .set({
        status: "cancelled",
        updatedAt: sql`now()`,
      })
      .where(eq(purchase_tb_purchase_orders.id, orderId))
      .returning();

    if (!updated) {
      throw new Error("Purchase order not found");
    }

    return updated;
  };
}
