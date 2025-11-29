import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Shipping Methods
export const table_shipping_method = pgTable(
  "shipping_methods",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 50 }).notNull(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
    baseFee: numeric("base_fee", { precision: 14, scale: 2 }), // Base shipping fee
    isActive: boolean("is_active").default(true).notNull(),
    order: numeric("order", { precision: 5, scale: 0 }).default("0").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("shipping_methods_code_idx").on(table.code),
    index("shipping_methods_active_idx").on(table.isActive),
  ]
);

export type TblShippingMethod = typeof table_shipping_method.$inferSelect;
export type NewTblShippingMethod = typeof table_shipping_method.$inferInsert;

