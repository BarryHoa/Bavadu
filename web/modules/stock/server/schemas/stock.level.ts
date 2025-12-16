import { sql } from "drizzle-orm";
import {
  index,
  numeric,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { product_tb_product_masters } from "../../../product/server/schemas/product.master";

import { mdlStockSchema } from "./schema";
import { stock_tb_stock_warehouses } from "./stock.warehouse";

export const stock_tb_stock_levels = mdlStockSchema.table(
  "levels",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    productId: uuid("product_id")
      .notNull()
      .references(() => product_tb_product_masters.id, {
        onDelete: "cascade",
      }),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => stock_tb_stock_warehouses.id, {
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
    uniqueIndex("levels_product_warehouse_unique").on(
      table.productId,
      table.warehouseId,
    ),
    index("levels_product_idx").on(table.productId),
    index("levels_warehouse_idx").on(table.warehouseId),
    // Composite index for low stock queries (quantity < threshold)
    index("levels_warehouse_quantity_idx").on(
      table.warehouseId,
      table.quantity,
    ),
  ],
);

export type StockTbStockLevel = typeof stock_tb_stock_levels.$inferSelect;
export type NewStockTbStockLevel = typeof stock_tb_stock_levels.$inferInsert;
