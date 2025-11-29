import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Payment Methods
export const table_payment_method = pgTable(
  "payment_methods",
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
    index("payment_methods_code_idx").on(table.code),
    index("payment_methods_active_idx").on(table.isActive),
  ]
);

export type TblPaymentMethod = typeof table_payment_method.$inferSelect;
export type NewTblPaymentMethod = typeof table_payment_method.$inferInsert;

// Payment Terms
export const table_payment_term = pgTable(
  "payment_terms",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 50 }).notNull(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
    days: numeric("days", { precision: 5, scale: 0 }), // Number of days (e.g., 30 for Net 30)
    isActive: boolean("is_active").default(true).notNull(),
    order: numeric("order", { precision: 5, scale: 0 }).default("0").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("payment_terms_code_idx").on(table.code),
    index("payment_terms_active_idx").on(table.isActive),
  ]
);

export type TblPaymentTerm = typeof table_payment_term.$inferSelect;
export type NewTblPaymentTerm = typeof table_payment_term.$inferInsert;

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

// Tax Rates
export const table_tax_rate = pgTable(
  "tax_rates",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 50 }).notNull(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
    rate: numeric("rate", { precision: 5, scale: 2 }).notNull(), // Tax rate percentage (e.g., 10.00 for 10%)
    isActive: boolean("is_active").default(true).notNull(),
    order: numeric("order", { precision: 5, scale: 0 }).default("0").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("tax_rates_code_idx").on(table.code),
    index("tax_rates_active_idx").on(table.isActive),
  ]
);

export type TblTaxRate = typeof table_tax_rate.$inferSelect;
export type NewTblTaxRate = typeof table_tax_rate.$inferInsert;

