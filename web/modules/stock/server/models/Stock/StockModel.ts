import { and, asc, eq, sql } from "drizzle-orm";

import { getEnv } from "@base/server";
import { BaseModel } from "@base/server/models/BaseModel";
import type {
  NewTblStockWarehouse,
  TblStockLevel,
  TblStockWarehouse,
} from "../../schemas";
import {
  table_stock_level,
  table_stock_move,
  table_stock_warehouse,
} from "../../schemas";

type StockMovementKind = "inbound" | "outbound" | "adjustment" | "transfer";

interface MovementBaseInput {
  productId: string;
  reference?: string;
  note?: string;
  userId?: string;
}

interface AdjustStockInput extends MovementBaseInput {
  warehouseId: string;
  quantityDelta: number;
}

interface InboundStockInput extends MovementBaseInput {
  warehouseId: string;
  quantity: number;
}

interface OutboundStockInput extends MovementBaseInput {
  warehouseId: string;
  quantity: number;
}

interface TransferStockInput extends MovementBaseInput {
  sourceWarehouseId: string;
  targetWarehouseId: string;
  quantity: number;
}

interface WarehousePayload {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

interface StockSummaryFilter {
  productId?: string;
  warehouseId?: string;
}

export default class StockModel extends BaseModel<typeof table_stock_move> {
  constructor() {
    super(table_stock_move);
  }

  async listWarehouses(): Promise<TblStockWarehouse[]> {
    const db = getEnv().getDb();
    return db
      .select()
      .from(table_stock_warehouse)
      .orderBy(asc(table_stock_warehouse.name));
  }

  async getWarehouse(id: string): Promise<TblStockWarehouse | null> {
    const db = getEnv().getDb();
    const [record] = await db
      .select()
      .from(table_stock_warehouse)
      .where(eq(table_stock_warehouse.id, id))
      .limit(1);
    return record ?? null;
  }

  async createWarehouse(payload: WarehousePayload): Promise<TblStockWarehouse> {
    const db = getEnv().getDb();
    const insertPayload: NewTblStockWarehouse = {
      code: payload.code.trim(),
      name: payload.name.trim(),
      description: payload.description,
      isActive: payload.isActive ?? true,
    };

    const [record] = await db
      .insert(table_stock_warehouse)
      .values(insertPayload)
      .returning();
    return record;
  }

  async updateWarehouse(
    id: string,
    payload: WarehousePayload
  ): Promise<TblStockWarehouse> {
    const db = getEnv().getDb();
    const [record] = await db
      .update(table_stock_warehouse)
      .set({
        code: payload.code.trim(),
        name: payload.name.trim(),
        description: payload.description,
        isActive: payload.isActive ?? true,
        updatedAt: sql`now()`,
      })
      .where(eq(table_stock_warehouse.id, id))
      .returning();

    if (!record) {
      throw new Error("Warehouse not found");
    }

    return record;
  }

  async adjustStock(input: AdjustStockInput) {
    if (!input.quantityDelta) {
      return this.getStockLevel(input.productId, input.warehouseId);
    }

    return this.applyDelta({
      ...input,
      type: "adjustment",
    });
  }

  async receiveStock(input: InboundStockInput) {
    if (input.quantity <= 0) {
      throw new Error("Inbound quantity must be positive");
    }

    return this.applyDelta({
      ...input,
      warehouseId: input.warehouseId,
      quantityDelta: input.quantity,
      type: "inbound",
    });
  }

  async issueStock(input: OutboundStockInput) {
    if (input.quantity <= 0) {
      throw new Error("Outbound quantity must be positive");
    }

    return this.applyDelta({
      ...input,
      warehouseId: input.warehouseId,
      quantityDelta: -Math.abs(input.quantity),
      type: "outbound",
    });
  }

  async transferStock(input: TransferStockInput) {
    if (input.sourceWarehouseId === input.targetWarehouseId) {
      throw new Error("Source and destination warehouses must be different");
    }
    if (input.quantity <= 0) {
      throw new Error("Transfer quantity must be positive");
    }

    const db = getEnv().getDb();
    return db.transaction(async (tx) => {
      await this.applyDelta(
        {
          productId: input.productId,
          warehouseId: input.sourceWarehouseId,
          quantityDelta: -Math.abs(input.quantity),
          reference: input.reference,
          note: input.note,
          userId: input.userId,
          type: "transfer",
          relatedWarehouseId: input.targetWarehouseId,
        },
        tx
      );

      await this.applyDelta(
        {
          productId: input.productId,
          warehouseId: input.targetWarehouseId,
          quantityDelta: Math.abs(input.quantity),
          reference: input.reference,
          note: input.note,
          userId: input.userId,
          type: "transfer",
          relatedWarehouseId: input.sourceWarehouseId,
        },
        tx
      );

      return true;
    });
  }

  async getStockLevel(
    productId: string,
    warehouseId: string
  ): Promise<TblStockLevel | null> {
    const db = getEnv().getDb();
    const [record] = await db
      .select()
      .from(table_stock_level)
      .where(
        and(
          eq(table_stock_level.productId, productId),
          eq(table_stock_level.warehouseId, warehouseId)
        )
      )
      .limit(1);

    return record ?? null;
  }

  async getStockSummary(filter: StockSummaryFilter = {}) {
    const db = getEnv().getDb();

    const whereClauses = [];

    if (filter.productId) {
      whereClauses.push(eq(table_stock_level.productId, filter.productId));
    }

    if (filter.warehouseId) {
      whereClauses.push(eq(table_stock_level.warehouseId, filter.warehouseId));
    }

    let query = db
      .select({
        productId: table_stock_level.productId,
        warehouseId: table_stock_level.warehouseId,
        quantity: table_stock_level.quantity,
        reservedQuantity: table_stock_level.reservedQuantity,
      })
      .from(table_stock_level) as any;

    if (whereClauses.length > 0) {
      query = query.where(and(...whereClauses));
    }

    const rows = (await query) as Array<{
      productId: string;
      warehouseId: string;
      quantity: string;
      reservedQuantity: string;
    }>;

    return rows.map((row) => ({
      ...row,
      quantity: Number(row.quantity),
      reservedQuantity: Number(row.reservedQuantity),
    }));
  }

  private async applyDelta(
    input: AdjustStockInput & {
      type: StockMovementKind;
      relatedWarehouseId?: string;
    },
    tx?: any
  ) {
    const now = new Date();
    const quantityDelta = Number(input.quantityDelta);
    const db = tx ?? getEnv().getDb();

    const [currentLevel] = await db
      .select()
      .from(table_stock_level)
      .where(
        and(
          eq(table_stock_level.productId, input.productId),
          eq(table_stock_level.warehouseId, input.warehouseId)
        )
      )
      .limit(1);

    const currentQty = currentLevel ? Number(currentLevel.quantity) : 0;
    const nextQty = currentQty + quantityDelta;

    if (nextQty < 0) {
      throw new Error(
        `Insufficient stock for product ${input.productId} in warehouse ${input.warehouseId}`
      );
    }

    await db
      .insert(table_stock_level)
      .values({
        productId: input.productId,
        warehouseId: input.warehouseId,
        quantity: nextQty.toString(),
        reservedQuantity: currentLevel?.reservedQuantity ?? "0",
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [table_stock_level.productId, table_stock_level.warehouseId],
        set: {
          quantity: sql`${table_stock_level.quantity} + ${quantityDelta}`,
          updatedAt: now,
        },
      });

    const [moveRecord] = await db
      .insert(table_stock_move)
      .values({
        productId: input.productId,
        quantity: quantityDelta.toString(),
        type: input.type,
        sourceWarehouseId:
          input.type === "outbound" || quantityDelta < 0
            ? input.warehouseId
            : input.relatedWarehouseId,
        targetWarehouseId:
          input.type === "inbound" || quantityDelta > 0
            ? input.warehouseId
            : input.relatedWarehouseId,
        reference: input.reference,
        note: input.note,
        createdBy: input.userId,
        createdAt: now,
      })
      .returning();

    return moveRecord;
  }
}
