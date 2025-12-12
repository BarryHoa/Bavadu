import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  numeric,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdBaseSchema } from "./schema";

// Payment Terms
export const table_payment_term = mdBaseSchema.table(
  "payment_terms",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 50 }).notNull(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    type: varchar("type", { length: 50 }).notNull().default("all"), // 'b2c', 'b2b', 'all'
    description: jsonb("description"), // LocaleDataType<string>
    days: numeric("days", { precision: 5, scale: 0 }), // Number of days (e.g., 30 for Net 30)
    isActive: boolean("is_active").default(true).notNull(),
    order: numeric("order", { precision: 5, scale: 0 }).default("0").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Unique constraint: không được trùng code và type
    uniqueIndex("payment_terms_code_type_unique").on(table.code, table.type),
    index("payment_terms_code_idx").on(table.code),
    index("payment_terms_active_idx").on(table.isActive),
    index("payment_terms_type_idx").on(table.type),
    index("payment_terms_type_active_idx").on(table.type, table.isActive),
  ]
);

export type TblPaymentTerm = typeof table_payment_term.$inferSelect;
export type NewTblPaymentTerm = typeof table_payment_term.$inferInsert;
