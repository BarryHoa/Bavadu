import {
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_product_master } from "../../../product/server/schemas/product-master";
import { table_stock_warehouse } from "./warehouse";

export const table_stock_move = pgTable("stock_moves", {
  id: uuid("id").primaryKey().defaultRandom(),
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
});

export type TblStockMove = typeof table_stock_move.$inferSelect;
export type NewTblStockMove = typeof table_stock_move.$inferInsert;
