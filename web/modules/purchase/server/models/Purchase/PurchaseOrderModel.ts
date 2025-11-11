import { and, desc, eq, sql } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import { getEnv } from "@base/server";
import {
  table_purchase_order,
  table_purchase_order_line,
} from "../../schemas";
import type {
  NewTblPurchaseOrder,
  TblPurchaseOrder,
  TblPurchaseOrderLine,
} from "../../schemas";
import type StockModel from "../../../../stock/server/models/Stock/StockModel";

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
  typeof table_purchase_order
> {
  constructor() {
    super(table_purchase_order);
  }

  async list(): Promise<TblPurchaseOrder[]> {
    const db = getEnv().getDb();
    return db
      .select()
      .from(table_purchase_order)
      .orderBy(desc(table_purchase_order.createdAt));
  }

  async getById(id: string) {
    const db = getEnv().getDb();
    const [order] = await db
      .select()
      .from(table_purchase_order)
      .where(eq(table_purchase_order.id, id))
      .limit(1);
    if (!order) {
      return null;
    }
    const lines = await db
      .select()
      .from(table_purchase_order_line)
      .where(eq(table_purchase_order_line.orderId, order.id));
    return { order, lines };
  }

  async create(input: CreatePurchaseOrderInput) {
    if (!input.lines?.length) {
      throw new Error("Purchase order requires at least one line");
    }

    const db = getEnv().getDb();
    const now = new Date();
    const generatedCode =
      input.code?.trim() ||
      `PO-${now.getFullYear()}${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${now
        .getDate()
        .toString()
        .padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    return db.transaction(async (tx) => {
      const orderPayload: NewTblPurchaseOrder = {
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
        .insert(table_purchase_order)
        .values(orderPayload)
        .returning();

      let totalAmount = 0;

      for (const line of input.lines) {
        const quantity = Number(line.quantity ?? 0);
        if (quantity <= 0) continue;

        const unitPrice = Number(line.unitPrice ?? 0);
        totalAmount += quantity * unitPrice;

        await tx.insert(table_purchase_order_line).values({
          orderId: order.id,
          productId: line.productId,
          description: line.description,
          quantityOrdered: quantity.toString(),
          quantityReceived: "0",
          unitPrice: unitPrice.toString(),
        });
      }

      await tx
        .update(table_purchase_order)
        .set({
          totalAmount: totalAmount.toString(),
          updatedAt: now,
        })
        .where(eq(table_purchase_order.id, order.id));

      const result = await this.getById(order.id);
      if (!result) {
        throw new Error("Failed to load purchase order after creation");
      }
      return result;
    });
  }

  async confirm(orderId: string) {
    const db = getEnv().getDb();
    const [updated] = await db
      .update(table_purchase_order)
      .set({
        status: "confirmed",
        updatedAt: sql`now()`,
      })
      .where(eq(table_purchase_order.id, orderId))
      .returning();

    if (!updated) {
      throw new Error("Purchase order not found");
    }

    return updated;
  }

  async receive(input: ReceivePurchaseOrderInput) {
    const db = getEnv().getDb();
    const env = getEnv();
    const stockModel = env.getModel("stock") as StockModel | undefined;

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

    const linesById = new Map<string, TblPurchaseOrderLine>();
    for (const line of lines) {
      linesById.set(line.id, line);
    }

    const now = new Date();

    await db.transaction(async (tx) => {
      for (const receivedLine of input.lines) {
        const line = linesById.get(receivedLine.lineId);
        if (!line) {
          throw new Error(
            `Purchase order line ${receivedLine.lineId} not found`
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
            `Cannot receive more than ordered for product ${line.productId}`
          );
        }

        await tx
          .update(table_purchase_order_line)
          .set({
            quantityReceived: nextReceived.toString(),
            updatedAt: now,
          })
          .where(eq(table_purchase_order_line.id, line.id));

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
              WHERE ${table_purchase_order_line.quantityOrdered} > ${table_purchase_order_line.quantityReceived}
            )
          `,
        })
        .from(table_purchase_order_line)
        .where(eq(table_purchase_order_line.orderId, order.id));

      const status: PurchaseStatus =
        Number(sumRow?.unreceivedCount ?? 0) === 0 ? "received" : "confirmed";

      await tx
        .update(table_purchase_order)
        .set({
          status,
          warehouseId: defaultWarehouseId,
          updatedAt: now,
        })
        .where(eq(table_purchase_order.id, order.id));
    });

    return this.getById(order.id);
  }

  async cancel(orderId: string) {
    const db = getEnv().getDb();
    const [updated] = await db
      .update(table_purchase_order)
      .set({
        status: "cancelled",
        updatedAt: sql`now()`,
      })
      .where(eq(table_purchase_order.id, orderId))
      .returning();

    if (!updated) {
      throw new Error("Purchase order not found");
    }

    return updated;
  }

  getViewDataList = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<any>> => {
    const env = getEnv();
    const db = env.getDb();

    const { offset, limit, search } = this.getDefaultParamsForList(params);

    const baseQuery = db
      .select({
        id: table_purchase_order.id,
        code: table_purchase_order.code,
        vendorName: table_purchase_order.vendorName,
        status: table_purchase_order.status,
        expectedDate: table_purchase_order.expectedDate,
        warehouseId: table_purchase_order.warehouseId,
        totalAmount: table_purchase_order.totalAmount,
        currency: table_purchase_order.currency,
        notes: table_purchase_order.notes,
        createdAt: table_purchase_order.createdAt,
        updatedAt: table_purchase_order.updatedAt,
        total: sql<number>`count(*) over()::int`.as("total"),
      })
      .from(table_purchase_order);

    let composedQuery = baseQuery;
    if (search) {
      composedQuery = composedQuery.where(
        sql`(${table_purchase_order.code} ILIKE ${`%${search}%`} OR ${table_purchase_order.vendorName} ILIKE ${`%${search}%`})`
      ) as typeof composedQuery;
    }

    const results = await composedQuery
      .orderBy(desc(table_purchase_order.createdAt))
      .limit(limit)
      .offset(offset);

    const total = results.length > 0 ? results[0].total : 0;

    const list = results.map((row) => ({
      id: row.id,
      code: row.code,
      vendorName: row.vendorName,
      status: row.status,
      warehouseId: row.warehouseId ?? undefined,
      expectedDate: row.expectedDate?.getTime(),
      totalAmount: row.totalAmount ?? "0",
      currency: row.currency ?? "USD",
      notes: row.notes ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    }));

    return this.getPagination({
      data: list,
      total,
    });
  };
}

