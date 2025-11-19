import { sql } from "drizzle-orm";
import {
  index,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_product_variant } from "../../../product/server/schemas/product-variant";
import { table_purchase_order_line } from "../../../purchase/server/schemas/order-line";
import { table_stock_warehouse } from "./warehouse";

// Stock Lots - Quản lý từng lô hàng nhập (cho FIFO/LIFO)
export const table_stock_lot = pgTable(
  "stock_lots",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),

    // Product & Warehouse
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => table_product_variant.id, { onDelete: "cascade" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => table_stock_warehouse.id, { onDelete: "cascade" }),

    // Lot identification
    lotNumber: varchar("lot_number", { length: 100 }),
    batchNumber: varchar("batch_number", { length: 100 }), // Mã batch từ nhà cung cấp

    // Purchase info
    purchaseOrderLineId: uuid("purchase_order_line_id").references(
      () => table_purchase_order_line.id,
      { onDelete: "set null" }
    ),
    purchaseDate: timestamp("purchase_date", { withTimezone: true }).notNull(),

    // Cost & Quantity
    unitCost: numeric("unit_cost", { precision: 18, scale: 4 }).notNull(), // Giá vốn đơn vị
    quantityReceived: numeric("quantity_received", {
      precision: 14,
      scale: 2,
    }).notNull(), // Số lượng nhập
    quantityAvailable: numeric("quantity_available", {
      precision: 14,
      scale: 2,
    }).notNull(), // Số lượng còn lại
    quantityReserved: numeric("quantity_reserved", {
      precision: 14,
      scale: 2,
    })
      .notNull()
      .default("0"), // Số lượng đã đặt

    // Expiry (nếu có)
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    manufactureDate: timestamp("manufacture_date", { withTimezone: true }),

    // Status
    status: varchar("status", { length: 20 }).default("active"), // active, expired, depleted

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("stock_lots_variant_warehouse_idx").on(
      table.productVariantId,
      table.warehouseId
    ),
    index("stock_lots_lot_number_idx").on(table.lotNumber),
    index("stock_lots_purchase_date_idx").on(table.purchaseDate),
    index("stock_lots_expiry_idx").on(table.expiryDate),
    index("stock_lots_status_idx").on(table.status),
    index("stock_lots_purchase_order_line_idx").on(
      table.purchaseOrderLineId
    ),
    // Composite index for active lots with expiry tracking
    index("stock_lots_status_expiry_idx").on(table.status, table.expiryDate),
    // Composite index for variant and status (common query)
    index("stock_lots_variant_status_idx").on(
      table.productVariantId,
      table.status
    ),
    // Composite index for warehouse and status
    index("stock_lots_warehouse_status_idx").on(
      table.warehouseId,
      table.status
    ),
  ]
);

export type TblStockLot = typeof table_stock_lot.$inferSelect;
export type NewTblStockLot = typeof table_stock_lot.$inferInsert;

