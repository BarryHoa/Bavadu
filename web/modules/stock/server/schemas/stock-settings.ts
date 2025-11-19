import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { table_product_master } from "../../../product/server/schemas/product-master";
import { table_stock_warehouse } from "./warehouse";

// Stock Settings - Cấu hình tồn kho theo từng kho
export const table_stock_settings = pgTable(
  "stock_settings",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    productId: uuid("product_id")
      .notNull()
      .references(() => table_product_master.id, { onDelete: "cascade" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => table_stock_warehouse.id, { onDelete: "cascade" }),

    // Stock levels
    minStockLevel: numeric("min_stock_level", { precision: 14, scale: 2 }),
    reorderPoint: numeric("reorder_point", { precision: 14, scale: 2 }),
    maxStockLevel: numeric("max_stock_level", { precision: 14, scale: 2 }),

    // Optional: Lead time for reordering (days)
    leadTime: integer("lead_time"), // days

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("stock_settings_product_warehouse_unique").on(
      table.productId,
      table.warehouseId
    ),
    index("stock_settings_product_idx").on(table.productId),
    index("stock_settings_warehouse_idx").on(table.warehouseId),
    index("stock_settings_min_stock_idx").on(table.minStockLevel), // For low stock alerts
    // Composite index for warehouse and reorder point (low stock queries)
    index("stock_settings_warehouse_reorder_idx").on(
      table.warehouseId,
      table.reorderPoint
    ),
  ]
);

export type TblStockSettings = typeof table_stock_settings.$inferSelect;
export type NewTblStockSettings = typeof table_stock_settings.$inferInsert;
