import { sql } from "drizzle-orm";
import {
  index,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { table_product_master } from "../../../product/server/schemas/product-master";
import { table_stock_warehouse } from "./warehouse";

export const table_stock_level = pgTable(
  "stock_levels",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    productId: uuid("product_id")
      .notNull()
      .references(() => table_product_master.id, {
        onDelete: "cascade",
      }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => table_stock_warehouse.id, {
        onDelete: "cascade",
      }),
    quantity: numeric("quantity", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    reservedQuantity: numeric("reserved_quantity", {
      precision: 14,
      scale: 2,
    })
      .notNull()
      .default("0"),
    
    // Average Cost fields (used for average cost method)
    averageCost: numeric("average_cost", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    totalCostValue: numeric("total_cost_value", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("stock_levels_product_warehouse_unique").on(
      table.productId,
      table.warehouseId
    ),
    index("stock_levels_product_idx").on(table.productId),
    index("stock_levels_warehouse_idx").on(table.warehouseId),
    // Composite index for low stock queries (quantity < threshold)
    index("stock_levels_warehouse_quantity_idx").on(
      table.warehouseId,
      table.quantity
    ),
  ]
);

export type TblStockLevel = typeof table_stock_level.$inferSelect;
export type NewTblStockLevel = typeof table_stock_level.$inferInsert;
