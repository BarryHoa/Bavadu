import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Tax Rates
export const table_tax_rate = pgTable(
  "tax_rates",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 50 }).notNull(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    type: varchar("type", { length: 50 }).notNull().default("all"), // 'b2c', 'b2b', 'all'
    description: jsonb("description"), // LocaleDataType<string>
    rate: numeric("rate", { precision: 5, scale: 2 }).notNull(), // Tax rate percentage (e.g., 10.00 for 10%)
    isActive: boolean("is_active").default(true).notNull(),
    order: numeric("order", { precision: 5, scale: 0 }).default("0").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Unique constraint: không được trùng code và type
    uniqueIndex("tax_rates_code_type_unique").on(table.code, table.type),
    index("tax_rates_code_idx").on(table.code),
    index("tax_rates_active_idx").on(table.isActive),
    index("tax_rates_type_idx").on(table.type),
    index("tax_rates_type_active_idx").on(table.type, table.isActive),
  ]
);

export type TblTaxRate = typeof table_tax_rate.$inferSelect;
export type NewTblTaxRate = typeof table_tax_rate.$inferInsert;
