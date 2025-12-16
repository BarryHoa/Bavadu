import type { StockTbStockLevel } from "../../schemas";

import { and, eq, sql } from "drizzle-orm";
import { BaseModel } from "@base/server/models/BaseModel";

import { stock_tb_stock_levels, stock_tb_stock_moves } from "../../schemas";

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

export default class StockModel extends BaseModel<typeof stock_tb_stock_moves> {
  constructor() {
    super(stock_tb_stock_moves);
  }

  adjustStock = async (input: AdjustStockInput) => {
    if (!input.quantityDelta) {
      return this.getStockLevel(input.productId, input.warehouseId);
    }

    return this.applyDelta({
      ...input,
      type: "adjustment",
    });
  };

  receiveStock = async (input: InboundStockInput) => {
    if (input.quantity <= 0) {
      throw new Error("Inbound quantity must be positive");
    }

    return this.applyDelta({
      ...input,
      warehouseId: input.warehouseId,
      quantityDelta: input.quantity,
      type: "inbound",
    });
  };

  issueStock = async (input: OutboundStockInput) => {
    if (input.quantity <= 0) {
      throw new Error("Outbound quantity must be positive");
    }

    return this.applyDelta({
      ...input,
      warehouseId: input.warehouseId,
      quantityDelta: -Math.abs(input.quantity),
      type: "outbound",
    });
  };

  transferStock = async (input: TransferStockInput) => {
    if (input.sourceWarehouseId === input.targetWarehouseId) {
      throw new Error("Source and destination warehouses must be different");
    }
    if (input.quantity <= 0) {
      throw new Error("Transfer quantity must be positive");
    }

    return this.db.transaction(async (tx) => {
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
        tx,
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
        tx,
      );

      return true;
    });
  };

  getStockLevel = async (
    productId: string,
    warehouseId: string,
  ): Promise<StockTbStockLevel | null> => {
    const [record] = await this.db
      .select()
      .from(stock_tb_stock_levels)
      .where(
        and(
          eq(stock_tb_stock_levels.productId, productId),
          eq(stock_tb_stock_levels.warehouseId, warehouseId),
        ),
      )
      .limit(1);

    return record ?? null;
  };

  private applyDelta = async (
    input: AdjustStockInput & {
      type: StockMovementKind;
      relatedWarehouseId?: string;
    },
    tx?: any,
  ) => {
    const now = new Date();
    const quantityDelta = Number(input.quantityDelta);
    const db = tx ?? this.db;

    const [currentLevel] = await db
      .select()
      .from(stock_tb_stock_levels)
      .where(
        and(
          eq(stock_tb_stock_levels.productId, input.productId),
          eq(stock_tb_stock_levels.warehouseId, input.warehouseId),
        ),
      )
      .limit(1);

    const currentQty = currentLevel ? Number(currentLevel.quantity) : 0;
    const nextQty = currentQty + quantityDelta;

    if (nextQty < 0) {
      throw new Error(
        `Insufficient stock for product ${input.productId} in warehouse ${input.warehouseId}`,
      );
    }

    await db
      .insert(stock_tb_stock_levels)
      .values({
        productId: input.productId,
        warehouseId: input.warehouseId,
        quantity: nextQty.toString(),
        reservedQuantity: currentLevel?.reservedQuantity ?? "0",
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          stock_tb_stock_levels.productId,
          stock_tb_stock_levels.warehouseId,
        ],
        set: {
          quantity: sql`${stock_tb_stock_levels.quantity} + ${quantityDelta}`,
          updatedAt: now,
        },
      });

    const [moveRecord] = await db
      .insert(stock_tb_stock_moves)
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
  };
}
