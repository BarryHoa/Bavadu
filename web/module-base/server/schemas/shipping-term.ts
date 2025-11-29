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

// Shipping Terms
export const table_shipping_term = pgTable(
  "shipping_terms",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 50 }).notNull(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
    isActive: boolean("is_active").default(true).notNull(),
    order: numeric("order", { precision: 5, scale: 0 }).default("0").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("shipping_terms_code_idx").on(table.code),
    index("shipping_terms_active_idx").on(table.isActive),
  ]
);

export type TblShippingTerm = typeof table_shipping_term.$inferSelect;
export type NewTblShippingTerm = typeof table_shipping_term.$inferInsert;

