import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  numeric,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdBaseSchema } from "./schema";

// Shipping Methods
export const base_tb_shipping_methods = mdBaseSchema.table(
  "shipping_methods",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 50 }).notNull(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: text("description"), // Text description
    type: varchar("type", { length: 50 }).notNull(), // 'b2c', 'b2b', 'all' , b2b-internal, b2b-external
    baseFee: numeric("base_fee", { precision: 14, scale: 2 }), // Base shipping fee
    isActive: boolean("is_active").default(true).notNull(),
    order: numeric("order", { precision: 5, scale: 0 }).default("0").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Unique constraint: không được trùng code và type
    uniqueIndex("shipping_methods_code_type_unique").on(table.code, table.type),
    index("shipping_methods_code_idx").on(table.code),
    index("shipping_methods_active_idx").on(table.isActive),
  ],
);

export type BaseTbShippingMethod = typeof base_tb_shipping_methods.$inferSelect;
export type NewBaseTbShippingMethod =
  typeof base_tb_shipping_methods.$inferInsert;
