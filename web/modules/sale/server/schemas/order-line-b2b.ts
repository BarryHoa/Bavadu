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
import { table_sales_order_b2b } from "./order-b2b";

export const table_sales_order_line_b2b = pgTable(
  "sales_order_lines_b2b",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    orderId: uuid("order_id")
      .notNull()
      .references(() => table_sales_order_b2b.id, { onDelete: "cascade" }),
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
    
    // Pricing fields
    lineDiscount: numeric("line_discount", { precision: 14, scale: 2 })
      .notNull()
      .default("0"), // Fixed amount discount
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 })
      .notNull()
      .default("0"), // Tax rate percentage
    lineTax: numeric("line_tax", { precision: 14, scale: 2 })
      .notNull()
      .default("0"), // Calculated tax amount
    lineSubtotal: numeric("line_subtotal", { precision: 14, scale: 2 })
      .notNull()
      .default("0"), // quantity * unitPrice
    lineTotal: numeric("line_total", { precision: 14, scale: 2 })
      .notNull()
      .default("0"), // lineSubtotal - lineDiscount + lineTax
    
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("sales_order_lines_b2b_order_idx").on(table.orderId),
    index("sales_order_lines_b2b_product_idx").on(table.productId),
  ]
);

export type TblSalesOrderLineB2B = typeof table_sales_order_line_b2b.$inferSelect;
export type NewTblSalesOrderLineB2B = typeof table_sales_order_line_b2b.$inferInsert;

