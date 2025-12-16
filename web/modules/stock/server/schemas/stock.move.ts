import { sql } from "drizzle-orm";
import { index, numeric, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { product_tb_product_masters } from "../../../product/server/schemas/product.master";

import { mdlStockSchema } from "./schema";
import { stock_tb_stock_warehouses } from "./stock.warehouse";

export const stock_tb_stock_moves = mdlStockSchema.table(
  "moves",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    productId: uuid("product_id")
      .notNull()
      .references(() => product_tb_product_masters.id, { onDelete: "cascade" }),
    quantity: numeric("quantity", { precision: 14, scale: 2 }).notNull(),
    type: varchar("type", { length: 32 }).notNull(), // inbound | outbound | adjustment | transfer
    sourceWarehouseId: uuid("source_warehouse_id").references(
      () => stock_tb_stock_warehouses.id,
      { onDelete: "set null" },
    ),
    targetWarehouseId: uuid("target_warehouse_id").references(
      () => stock_tb_stock_warehouses.id,
      { onDelete: "set null" },
    ),
    reference: varchar("reference", { length: 128 }),
    note: varchar("note", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    index("moves_product_idx").on(table.productId),
    index("moves_type_idx").on(table.type),
    index("moves_source_idx").on(table.sourceWarehouseId),
    index("moves_target_idx").on(table.targetWarehouseId),
    index("moves_created_idx").on(table.createdAt),
    // Composite index for common query: get moves by product and type
    index("moves_product_type_idx").on(table.productId, table.type),
    // Composite index for date range queries with product
    index("moves_product_created_idx").on(table.productId, table.createdAt),
    // Composite index for warehouse queries
    index("moves_source_created_idx").on(
      table.sourceWarehouseId,
      table.createdAt,
    ),
    index("moves_target_created_idx").on(
      table.targetWarehouseId,
      table.createdAt,
    ),
  ],
);

export type StockTbStockMove = typeof stock_tb_stock_moves.$inferSelect;
export type NewStockTbStockMove = typeof stock_tb_stock_moves.$inferInsert;
