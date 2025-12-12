import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { mdlStockSchema } from "./schema";
import { product_tb_product_masters } from "../../../product/server/schemas/product.master";
import { stock_tb_stock_warehouses } from "./stock.warehouse";

// Stock Settings - Cấu hình tồn kho theo từng kho
export const stock_tb_stock_settings = mdlStockSchema.table(
  "settings",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    productId: uuid("product_id")
      .notNull()
      .references(() => product_tb_product_masters.id, { onDelete: "cascade" }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => stock_tb_stock_warehouses.id, { onDelete: "cascade" }),

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
    uniqueIndex("settings_product_warehouse_unique").on(
      table.productId,
      table.warehouseId
    ),
    index("settings_product_idx").on(table.productId),
    index("settings_warehouse_idx").on(table.warehouseId),
    index("settings_min_stock_idx").on(table.minStockLevel), // For low stock alerts
    // Composite index for warehouse and reorder point (low stock queries)
    index("settings_warehouse_reorder_idx").on(
      table.warehouseId,
      table.reorderPoint
    ),
  ]
);

export type StockTbStockSettings = typeof stock_tb_stock_settings.$inferSelect;
export type NewStockTbStockSettings = typeof stock_tb_stock_settings.$inferInsert;
