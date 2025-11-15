import { desc, eq, sql } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import { getEnv } from "@base/server";
import {
  table_sales_order,
  table_sales_order_line,
} from "../../schemas";
import type {
  NewTblSalesOrder,
  TblSalesOrder,
  TblSalesOrderLine,
} from "../../schemas";
import type StockModel from "../../../../stock/server/models/Stock/StockModel";

type SalesStatus = "draft" | "confirmed" | "fulfilled" | "cancelled";

interface SalesOrderLineInput {
  productId: string;
  quantity: number;
  unitPrice?: number;
  description?: string;
}

interface CreateSalesOrderInput {
  code?: string;
  customerName: string;
  warehouseId?: string;
  expectedDate?: string;
  currency?: string;
  notes?: string;
  lines: SalesOrderLineInput[];
  userId?: string;
}

interface DeliverSalesOrderInput {
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

export default class SalesOrderModel extends BaseModel<
  typeof table_sales_order
> {
  constructor() {
    super(table_sales_order);
  }

  list = async (): Promise<TblSalesOrder[]> => {
    const db = getEnv().getDb();
    return db
      .select()
      .from(table_sales_order)
      .orderBy(desc(table_sales_order.createdAt));
  };

  getById = async (id: string) => {
    const db = getEnv().getDb();
    const [order] = await db
      .select()
      .from(table_sales_order)
      .where(eq(table_sales_order.id, id))
      .limit(1);
    if (!order) {
      return null;
    }
    const lines = await db
      .select()
      .from(table_sales_order_line)
      .where(eq(table_sales_order_line.orderId, order.id));
    return { order, lines };
  };

  create = async (input: CreateSalesOrderInput) => {
    if (!input.lines?.length) {
      throw new Error("Sales order requires at least one line");
    }

    const db = getEnv().getDb();
    const now = new Date();
    const generatedCode =
      input.code?.trim() ||
      `SO-${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now
        .getDate()
        .toString()
        .padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return db.transaction(async (tx) => {
      const orderPayload: NewTblSalesOrder = {
        code: generatedCode,
        customerName: input.customerName.trim(),
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
        .insert(table_sales_order)
        .values(orderPayload)
        .returning();

      let totalAmount = 0;

      for (const line of input.lines) {
        const quantity = Number(line.quantity ?? 0);
        if (quantity <= 0) continue;

        const unitPrice = Number(line.unitPrice ?? 0);
        totalAmount += quantity * unitPrice;

        await tx.insert(table_sales_order_line).values({
          orderId: order.id,
          productId: line.productId,
          description: line.description,
          quantityOrdered: quantity.toString(),
          quantityDelivered: "0",
          unitPrice: unitPrice.toString(),
        });
      }

      await tx
        .update(table_sales_order)
        .set({
          totalAmount: totalAmount.toString(),
          updatedAt: now,
        })
        .where(eq(table_sales_order.id, order.id));

      const result = await this.getById(order.id);
      if (!result) {
        throw new Error("Failed to load sales order after creation");
      }
      return result;
    });
  };

  confirm = async (orderId: string) => {
    const db = getEnv().getDb();
    const [updated] = await db
      .update(table_sales_order)
      .set({
        status: "confirmed",
        updatedAt: sql`now()`,
      })
      .where(eq(table_sales_order.id, orderId))
      .returning();

    if (!updated) {
      throw new Error("Sales order not found");
    }

    return updated;
  };

  deliver = async (input: DeliverSalesOrderInput) => {
    const db = getEnv().getDb();
    const env = getEnv();
    const stockModel = env.getModel("stock") as StockModel | undefined;

    if (!stockModel) {
      throw new Error("Stock model is not registered");
    }

    const orderData = await this.getById(input.orderId);
    if (!orderData) {
      throw new Error("Sales order not found");
    }
    const { order, lines } = orderData;

    const defaultWarehouseId =
      input.warehouseId ?? order.warehouseId ?? undefined;

    if (!defaultWarehouseId) {
      throw new Error("Warehouse is required to deliver sales order");
    }

    const linesById = new Map<string, TblSalesOrderLine>();
    for (const line of lines) {
      linesById.set(line.id, line);
    }

    const now = new Date();

    await db.transaction(async (tx) => {
      for (const deliveredLine of input.lines) {
        const line = linesById.get(deliveredLine.lineId);
        if (!line) {
          throw new Error(
            `Sales order line ${deliveredLine.lineId} not found`
          );
        }

        const quantity = Number(deliveredLine.quantity ?? 0);
        if (quantity <= 0) continue;

        const alreadyDelivered = Number(line.quantityDelivered ?? 0);
        const orderedQty = Number(line.quantityOrdered ?? 0);
        const nextDelivered = alreadyDelivered + quantity;

        if (nextDelivered - orderedQty > 0.0001) {
          throw new Error(
            `Cannot deliver more than ordered for product ${line.productId}`
          );
        }

        await tx
          .update(table_sales_order_line)
          .set({
            quantityDelivered: nextDelivered.toString(),
            updatedAt: now,
          })
          .where(eq(table_sales_order_line.id, line.id));

        await stockModel.issueStock({
          productId: line.productId,
          warehouseId: defaultWarehouseId,
          quantity,
          reference: `SO:${order.code}`,
          note: input.note,
          userId: input.userId,
        });
      }

      const [sumRow] = await tx
        .select({
          undeliveredCount: sql`
            count(*) FILTER (
              WHERE ${table_sales_order_line.quantityOrdered} > ${table_sales_order_line.quantityDelivered}
            )
          `,
        })
        .from(table_sales_order_line)
        .where(eq(table_sales_order_line.orderId, order.id));

      const status: SalesStatus =
        Number(sumRow?.undeliveredCount ?? 0) === 0 ? "fulfilled" : "confirmed";

      await tx
        .update(table_sales_order)
        .set({
          status,
          warehouseId: defaultWarehouseId,
          updatedAt: now,
        })
        .where(eq(table_sales_order.id, order.id));
    });

    return this.getById(order.id);
  };

  cancel = async (orderId: string) => {
    const db = getEnv().getDb();
    const [updated] = await db
      .update(table_sales_order)
      .set({
        status: "cancelled",
        updatedAt: sql`now()`,
      })
      .where(eq(table_sales_order.id, orderId))
      .returning();

    if (!updated) {
      throw new Error("Sales order not found");
    }

    return updated;
  };

}

