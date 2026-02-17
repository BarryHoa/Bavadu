import type { StockTbStockLevel, StockTbStockMove } from "../../schemas";

import { and, eq, sql } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";

import { stock_tb_stock_levels, stock_tb_stock_moves } from "../../schemas";
import {
  StockMoveAction,
  StockMoveFrom,
  StockMoveType,
  StockMoveTypes,
  createStockMoveType,
} from "../../types/StockMoveTypes";

/**
 * Unified Inventory Manager - Core Engine
 *
 * Xử lý tất cả logic kho chung cho cả B2B và B2C
 * Đây là shared core engine, các module khác (B2B Service, B2C Service) sẽ gọi vào đây
 */
export default class InventoryCoreManagement extends BaseModel<
  typeof stock_tb_stock_levels
> {
  constructor() {
    super(stock_tb_stock_levels);
  }

  /**
   * Kiểm tra tồn kho có sẵn (Available = Total - Reserved)
   * @param productId ID sản phẩm
   * @param warehouseId ID kho
   * @param quantity Số lượng cần kiểm tra
   * @returns true nếu có đủ hàng, false nếu không đủ
   */
  async checkAvailability(
    productId: string,
    warehouseId: string,
    quantity: number
  ): Promise<boolean> {
    const stockLevel = await this.getStockLevel(productId, warehouseId);

    if (!stockLevel) {
      return false;
    }

    const totalQuantity = Number(stockLevel.quantity);
    const reservedQuantity = Number(stockLevel.reservedQuantity);
    const availableQuantity = totalQuantity - reservedQuantity;

    return availableQuantity >= quantity;
  }

  /**
   * Đặt chỗ hàng (Reserve stock)
   * TODO: Implement reservation table khi cần
   * @param productId ID sản phẩm
   * @param warehouseId ID kho
   * @param quantity Số lượng cần đặt chỗ
   * @param documentType Loại document (sales_order, etc.)
   * @param documentId ID của document
   * @returns Stock level sau khi đặt chỗ
   */
  async reserveStock(
    productId: string,
    warehouseId: string,
    quantity: number,
    documentType: string,
    documentId: string
  ): Promise<StockTbStockLevel> {
    if (quantity <= 0) {
      throw new Error("Reservation quantity must be positive");
    }

    // Kiểm tra availability trước
    const isAvailable = await this.checkAvailability(
      productId,
      warehouseId,
      quantity
    );

    if (!isAvailable) {
      throw new Error(
        `Insufficient available stock for product ${productId} in warehouse ${warehouseId}`
      );
    }

    // Tăng reserved quantity
    const now = new Date();
    const [updated] = await this.db
      .update(stock_tb_stock_levels)
      .set({
        reservedQuantity: sql`${stock_tb_stock_levels.reservedQuantity} + ${quantity}`,
        updatedAt: now,
      })
      .where(
        and(
          eq(stock_tb_stock_levels.productId, productId),
          eq(stock_tb_stock_levels.warehouseId, warehouseId)
        )
      )
      .returning();

    if (!updated) {
      // Nếu chưa có stock level, tạo mới
      const [created] = await this.db
        .insert(stock_tb_stock_levels)
        .values({
          productId,
          warehouseId,
          quantity: "0",
          reservedQuantity: quantity.toString(),
          updatedAt: now,
        })
        .returning();

      if (!created) {
        throw new Error("Failed to create stock level for reservation");
      }

      return created;
    }

    return updated;
  }

  /**
   * Hủy đặt chỗ (Release reservation)
   * @param productId ID sản phẩm
   * @param warehouseId ID kho
   * @param quantity Số lượng cần hủy đặt chỗ
   * @returns Stock level sau khi hủy đặt chỗ
   */
  async releaseReservation(
    productId: string,
    warehouseId: string,
    quantity: number
  ): Promise<StockTbStockLevel> {
    if (quantity <= 0) {
      throw new Error("Release quantity must be positive");
    }

    const now = new Date();
    const [updated] = await this.db
      .update(stock_tb_stock_levels)
      .set({
        reservedQuantity: sql`GREATEST(${stock_tb_stock_levels.reservedQuantity} - ${quantity}, 0)`,
        updatedAt: now,
      })
      .where(
        and(
          eq(stock_tb_stock_levels.productId, productId),
          eq(stock_tb_stock_levels.warehouseId, warehouseId)
        )
      )
      .returning();

    if (!updated) {
      throw new Error(
        `Stock level not found for product ${productId} in warehouse ${warehouseId}`
      );
    }

    return updated;
  }

  /**
   * Nhập kho (Unified - dùng cho cả B2B và B2C)
   * @param params Tham số nhập kho
   * @returns Stock move record
   */
  async receiveStock(params: {
    productId: string;
    warehouseId: string;
    quantity: number;
    from: StockMoveFrom; // PURCHASE, PRODUCTION, RETURN, TRANSFER, ADJUSTMENT
    reference?: string;
    documentType?: string;
    documentId?: string;
    note?: string;
    userId?: string;
  }): Promise<StockTbStockMove> {
    if (params.quantity <= 0) {
      throw new Error("Inbound quantity must be positive");
    }

    const moveType = createStockMoveType(StockMoveAction.INBOUND, params.from);

    return this.applyStockDelta({
      productId: params.productId,
      warehouseId: params.warehouseId,
      quantityDelta: params.quantity,
      moveType,
      reference: params.reference,
      note: params.note,
      userId: params.userId,
      sourceWarehouseId: undefined,
      targetWarehouseId: params.warehouseId,
    });
  }

  /**
   * Xuất kho (Unified - dùng cho cả B2B và B2C)
   * @param params Tham số xuất kho
   * @returns Stock move record
   */
  async issueStock(params: {
    productId: string;
    warehouseId: string;
    quantity: number;
    from: StockMoveFrom; // SALES_B2B, SALES_B2C, RETAIL, DEALER, PRODUCTION_ISSUE, EVENT, LOSS, ADJUSTMENT_DECREASE
    reference?: string;
    documentType?: string;
    documentId?: string;
    note?: string;
    userId?: string;
    releaseReservation?: boolean; // Có tự động release reservation không
  }): Promise<StockTbStockMove> {
    if (params.quantity <= 0) {
      throw new Error("Outbound quantity must be positive");
    }

    // Kiểm tra availability
    const isAvailable = await this.checkAvailability(
      params.productId,
      params.warehouseId,
      params.quantity
    );

    if (!isAvailable) {
      throw new Error(
        `Insufficient available stock for product ${params.productId} in warehouse ${params.warehouseId}`
      );
    }

    // Release reservation nếu có
    if (params.releaseReservation) {
      await this.releaseReservation(
        params.productId,
        params.warehouseId,
        params.quantity
      );
    }

    const moveType = createStockMoveType(StockMoveAction.OUTBOUND, params.from);

    return this.applyStockDelta({
      productId: params.productId,
      warehouseId: params.warehouseId,
      quantityDelta: -Math.abs(params.quantity),
      moveType,
      reference: params.reference,
      note: params.note,
      userId: params.userId,
      sourceWarehouseId: params.warehouseId,
      targetWarehouseId: undefined,
    });
  }

  /**
   * Điều chuyển kho (Transfer)
   * @param params Tham số điều chuyển
   * @returns Object chứa source move và target move
   */
  async transferStock(params: {
    productId: string;
    sourceWarehouseId: string;
    targetWarehouseId: string;
    quantity: number;
    reference?: string;
    note?: string;
    userId?: string;
  }): Promise<{ sourceMove: StockTbStockMove; targetMove: StockTbStockMove }> {
    if (params.sourceWarehouseId === params.targetWarehouseId) {
      throw new Error("Source and destination warehouses must be different");
    }

    if (params.quantity <= 0) {
      throw new Error("Transfer quantity must be positive");
    }

    // Kiểm tra availability tại kho nguồn
    const isAvailable = await this.checkAvailability(
      params.productId,
      params.sourceWarehouseId,
      params.quantity
    );

    if (!isAvailable) {
      throw new Error(
        `Insufficient available stock for product ${params.productId} in source warehouse ${params.sourceWarehouseId}`
      );
    }

    return this.db.transaction(async (tx) => {
      // Xuất từ kho nguồn
      const sourceMove = await this.applyStockDelta(
        {
          productId: params.productId,
          warehouseId: params.sourceWarehouseId,
          quantityDelta: -Math.abs(params.quantity),
          moveType: createStockMoveType(
            StockMoveAction.OUTBOUND,
            StockMoveFrom.TRANSFER
          ),
          reference: params.reference,
          note: params.note,
          userId: params.userId,
          sourceWarehouseId: params.sourceWarehouseId,
          targetWarehouseId: params.targetWarehouseId,
        },
        tx
      );

      // Nhập vào kho đích
      const targetMove = await this.applyStockDelta(
        {
          productId: params.productId,
          warehouseId: params.targetWarehouseId,
          quantityDelta: Math.abs(params.quantity),
          moveType: createStockMoveType(
            StockMoveAction.INBOUND,
            StockMoveFrom.TRANSFER
          ),
          reference: params.reference,
          note: params.note,
          userId: params.userId,
          sourceWarehouseId: params.sourceWarehouseId,
          targetWarehouseId: params.targetWarehouseId,
        },
        tx
      );

      return { sourceMove, targetMove };
    });
  }

  /**
   * Điều chỉnh kho (Adjustment)
   * @param params Tham số điều chỉnh
   * @returns Stock move record
   */
  async adjustStock(params: {
    productId: string;
    warehouseId: string;
    quantityDelta: number; // Có thể dương (tăng) hoặc âm (giảm)
    reason?: string;
    reference?: string;
    note?: string;
    userId?: string;
  }): Promise<StockTbStockMove> {
    if (params.quantityDelta === 0) {
      throw new Error("Quantity delta cannot be zero");
    }

    const moveType =
      params.quantityDelta > 0
        ? StockMoveTypes.INBOUND_ADJUSTMENT
        : StockMoveTypes.OUTBOUND_ADJUSTMENT;

    // Nếu giảm, kiểm tra tồn kho hiện tại
    if (params.quantityDelta < 0) {
      const stockLevel = await this.getStockLevel(
        params.productId,
        params.warehouseId
      );

      if (!stockLevel) {
        throw new Error(
          `Stock level not found for product ${params.productId} in warehouse ${params.warehouseId}`
        );
      }

      const currentQty = Number(stockLevel.quantity);
      const absoluteDelta = Math.abs(params.quantityDelta);

      if (currentQty < absoluteDelta) {
        throw new Error(
          `Insufficient stock for adjustment. Current: ${currentQty}, Requested: ${absoluteDelta}`
        );
      }
    }

    return this.applyStockDelta({
      productId: params.productId,
      warehouseId: params.warehouseId,
      quantityDelta: params.quantityDelta,
      moveType,
      reference: params.reference,
      note: params.note || params.reason,
      userId: params.userId,
      sourceWarehouseId:
        params.quantityDelta < 0 ? params.warehouseId : undefined,
      targetWarehouseId:
        params.quantityDelta > 0 ? params.warehouseId : undefined,
    });
  }

  /**
   * Lấy tồn kho hiện tại
   * @param productId ID sản phẩm
   * @param warehouseId ID kho
   * @returns Stock level hoặc null nếu không tồn tại
   */
  async getStockLevel(
    productId: string,
    warehouseId: string
  ): Promise<StockTbStockLevel | null> {
    const [record] = await this.db
      .select()
      .from(stock_tb_stock_levels)
      .where(
        and(
          eq(stock_tb_stock_levels.productId, productId),
          eq(stock_tb_stock_levels.warehouseId, warehouseId)
        )
      )
      .limit(1);

    return record ?? null;
  }

  /**
   * Lấy tồn kho có sẵn (Available = Total - Reserved)
   * @param productId ID sản phẩm
   * @param warehouseId ID kho
   * @returns Số lượng có sẵn
   */
  async getAvailableStock(
    productId: string,
    warehouseId: string
  ): Promise<number> {
    const stockLevel = await this.getStockLevel(productId, warehouseId);

    if (!stockLevel) {
      return 0;
    }

    const totalQuantity = Number(stockLevel.quantity);
    const reservedQuantity = Number(stockLevel.reservedQuantity);

    return Math.max(0, totalQuantity - reservedQuantity);
  }

  /**
   * Private method: Áp dụng thay đổi tồn kho và tạo stock move
   */
  private async applyStockDelta(
    params: {
      productId: string;
      warehouseId: string;
      quantityDelta: number;
      moveType: StockMoveType;
      reference?: string;
      note?: string;
      userId?: string;
      sourceWarehouseId?: string;
      targetWarehouseId?: string;
    },
    tx?: any
  ): Promise<StockTbStockMove> {
    const now = new Date();
    const quantityDelta = Number(params.quantityDelta);
    const db = tx ?? this.db;

    // Lấy tồn kho hiện tại
    const [currentLevel] = await db
      .select()
      .from(stock_tb_stock_levels)
      .where(
        and(
          eq(stock_tb_stock_levels.productId, params.productId),
          eq(stock_tb_stock_levels.warehouseId, params.warehouseId)
        )
      )
      .limit(1);

    const currentQty = currentLevel ? Number(currentLevel.quantity) : 0;
    const nextQty = currentQty + quantityDelta;

    // Kiểm tra tồn kho âm (chỉ với outbound)
    if (nextQty < 0) {
      throw new Error(
        `Insufficient stock for product ${params.productId} in warehouse ${params.warehouseId}. Current: ${currentQty}, Requested: ${Math.abs(quantityDelta)}`
      );
    }

    // Cập nhật hoặc tạo stock level
    await db
      .insert(stock_tb_stock_levels)
      .values({
        productId: params.productId,
        warehouseId: params.warehouseId,
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

    // Tạo stock move record
    const [moveRecord] = await db
      .insert(stock_tb_stock_moves)
      .values({
        productId: params.productId,
        quantity: quantityDelta.toString(),
        type: params.moveType, // StockMoveType sẽ được convert thành string
        sourceWarehouseId: params.sourceWarehouseId ?? null,
        targetWarehouseId: params.targetWarehouseId ?? null,
        reference: params.reference ?? null,
        note: params.note ?? null,
        createdBy: params.userId ?? null,
        createdAt: now,
      })
      .returning();

    if (!moveRecord) {
      throw new Error("Failed to create stock move record");
    }

    return moveRecord;
  }
}
