import { sql } from "drizzle-orm";
import {
  index,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_product_master } from "../../../product/server/schemas/product-master";
import { table_stock_warehouse } from "./warehouse";

export const table_stock_move = pgTable(
  "stock_moves",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
    productId: uuid("product_id")
      .notNull()
      .references(() => table_product_master.id, { onDelete: "cascade" }),
    quantity: numeric("quantity", { precision: 14, scale: 2 }).notNull(),
    type: varchar("type", { length: 32 }).notNull(), // inbound | outbound | adjustment | transfer
    sourceWarehouseId: uuid("source_warehouse_id").references(
      () => table_stock_warehouse.id,
      { onDelete: "set null" }
    ),
    targetWarehouseId: uuid("target_warehouse_id").references(
      () => table_stock_warehouse.id,
      { onDelete: "set null" }
    ),
    reference: varchar("reference", { length: 128 }),
    note: varchar("note", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    index("stock_moves_product_idx").on(table.productId),
    index("stock_moves_type_idx").on(table.type),
    index("stock_moves_source_idx").on(table.sourceWarehouseId),
    index("stock_moves_target_idx").on(table.targetWarehouseId),
    index("stock_moves_created_idx").on(table.createdAt),
  ]
);

export type TblStockMove = typeof table_stock_move.$inferSelect;
export type NewTblStockMove = typeof table_stock_move.$inferInsert;
