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

// Payment Methods
export const table_payment_method = pgTable(
  "payment_methods",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 50 }).notNull(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    type: varchar("type", { length: 50 }).notNull().default("all"), // 'b2c', 'b2b', 'all'
    description: jsonb("description"), // LocaleDataType<string>
    isActive: boolean("is_active").default(true).notNull(),
    order: numeric("order", { precision: 5, scale: 0 }).default("0").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Unique constraint: không được trùng code và type
    uniqueIndex("payment_methods_code_type_unique").on(table.code, table.type),
    index("payment_methods_code_idx").on(table.code),
    index("payment_methods_active_idx").on(table.isActive),
    index("payment_methods_type_idx").on(table.type),
    index("payment_methods_type_active_idx").on(table.type, table.isActive),
  ]
);

export type TblPaymentMethod = typeof table_payment_method.$inferSelect;
export type NewTblPaymentMethod = typeof table_payment_method.$inferInsert;
