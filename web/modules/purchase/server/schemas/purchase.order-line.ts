import { sql } from "drizzle-orm";
import { index, numeric, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { product_tb_product_masters } from "../../../product/server/schemas/product.master";

import { mdlPurchaseSchema } from "./schema";
import { purchase_tb_purchase_orders } from "./purchase.order";

export const purchase_tb_purchase_orders_line = mdlPurchaseSchema.table(
  "order_lines",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    orderId: uuid("order_id")
      .notNull()
      .references(() => purchase_tb_purchase_orders.id, {
        onDelete: "cascade",
      }),
    productId: uuid("product_id")
      .notNull()
      .references(() => product_tb_product_masters.id, {
        onDelete: "restrict",
      }),
    description: varchar("description", { length: 256 }),
    quantityOrdered: numeric("quantity_ordered", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    quantityReceived: numeric("quantity_received", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    unitPrice: numeric("unit_price", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("order_lines_order_idx").on(table.orderId),
    index("order_lines_product_idx").on(table.productId),
  ],
);

export type PurchaseTbPurchaseOrderLine =
  typeof purchase_tb_purchase_orders_line.$inferSelect;
export type NewPurchaseTbPurchaseOrderLine =
  typeof purchase_tb_purchase_orders_line.$inferInsert;
