import {
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const table_sales_order = pgTable("sales_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 64 }).notNull(),
  customerName: varchar("customer_name", { length: 128 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  warehouseId: uuid("warehouse_id"),
  expectedDate: timestamp("expected_date", { withTimezone: true }),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  currency: varchar("currency", { length: 8 }).default("USD"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: varchar("created_by", { length: 36 }),
});

export type TblSalesOrder = typeof table_sales_order.$inferSelect;
export type NewTblSalesOrder = typeof table_sales_order.$inferInsert;

