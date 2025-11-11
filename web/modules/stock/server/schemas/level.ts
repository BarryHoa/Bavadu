import {
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
    id: uuid("id").primaryKey().defaultRandom(),
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
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    uniqueProductWarehouse: uniqueIndex(
      "stock_levels_product_warehouse_unique"
    ).on(table.productId, table.warehouseId),
  })
);

export type TblStockLevel = typeof table_stock_level.$inferSelect;
export type NewTblStockLevel = typeof table_stock_level.$inferInsert;
