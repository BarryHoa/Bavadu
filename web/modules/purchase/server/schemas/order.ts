import { sql } from "drizzle-orm";
import {
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const table_purchase_order = pgTable(
  "purchase_orders",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 64 }).notNull(),
    vendorName: varchar("vendor_name", { length: 128 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    expectedDate: timestamp("expected_date", { withTimezone: true }),
    warehouseId: uuid("warehouse_id"),
    totalAmount: numeric("total_amount", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    currency: varchar("currency", { length: 8 }).default("USD"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    index("purchase_orders_code_idx").on(table.code),
    index("purchase_orders_vendor_idx").on(table.vendorName),
    index("purchase_orders_status_idx").on(table.status),
    index("purchase_orders_warehouse_idx").on(table.warehouseId),
    index("purchase_orders_expected_idx").on(table.expectedDate),
    index("purchase_orders_created_idx").on(table.createdAt),
  ]
);

export type TblPurchaseOrder = typeof table_purchase_order.$inferSelect;
export type NewTblPurchaseOrder = typeof table_purchase_order.$inferInsert;
