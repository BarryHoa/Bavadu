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
import { table_sales_order } from "./order";

export const table_sales_order_line = pgTable(
  "sales_order_lines",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    orderId: uuid("order_id")
      .notNull()
      .references(() => table_sales_order.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => table_product_master.id, { onDelete: "restrict" }),
    description: varchar("description", { length: 256 }),
    quantityOrdered: numeric("quantity_ordered", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    quantityDelivered: numeric("quantity_delivered", {
      precision: 14,
      scale: 2,
    })
      .notNull()
      .default("0"),
    unitPrice: numeric("unit_price", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("sales_order_lines_order_idx").on(table.orderId),
    index("sales_order_lines_product_idx").on(table.productId),
  ]
);

export type TblSalesOrderLine = typeof table_sales_order_line.$inferSelect;
export type NewTblSalesOrderLine = typeof table_sales_order_line.$inferInsert;
