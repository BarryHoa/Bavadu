import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdlSaleB2cSchema } from "./schema";

// ============================================
// Price List B2C
// ============================================
// Cấu trúc applicableTo:
// {
//   channels?: string[],      // ['online', 'offline', 'mobile_app']
//   stores?: string[],         // Store IDs
//   locations?: string[],      // Location IDs (HCM, HN, etc.)
//   regions?: string[],        // Region codes
//   customerGroups?: string[]  // Customer group IDs
// }
export const sale_b2c_tb_price_lists = mdlSaleB2cSchema.table(
  "price_lists",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 64 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: text("description"),
    type: varchar("type", { length: 20 }).notNull().default("standard"), // 'standard' | 'promotion' | 'seasonal' | 'flash_sale'
    status: varchar("status", { length: 20 }).notNull().default("active"), // 'draft' | 'active' | 'inactive' | 'expired'
    priority: integer("priority").notNull().default(0),
    currencyId: uuid("currency_id"), // FK -> currencies (mặc định VND)
    validFrom: timestamp("valid_from", { withTimezone: true }).notNull(), // Bắt buộc
    validTo: timestamp("valid_to", { withTimezone: true }), // NULL = mãi mãi (chỉ cho standard type)
    isDefault: boolean("is_default").notNull().default(false),
    applicableTo: jsonb("applicable_to").notNull(), // JSONB cho điều kiện áp dụng - Bắt buộc
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("price_lists_code_idx").on(table.code),
    index("price_lists_status_idx").on(table.status),
    index("price_lists_type_idx").on(table.type),
    index("price_lists_valid_dates_idx").on(table.validFrom, table.validTo),
    index("price_lists_default_idx")
      .on(table.isDefault)
      .where(sql`${table.isDefault} = true`),
    index("price_lists_applicable_to_idx").on(table.applicableTo),
    index("price_lists_type_status_idx").on(table.type, table.status),
    // Check constraint: validTo phải >= validFrom (nếu có)
    check(
      "price_lists_valid_dates_check",
      sql`(${table.validTo} IS NULL) OR (${table.validTo} >= ${table.validFrom})`,
    ),
    // Check constraint: Nếu type != 'standard' thì validTo không được NULL
    check(
      "price_lists_valid_to_required_check",
      sql`(${table.type} = 'standard') OR (${table.validTo} IS NOT NULL)`,
    ),
  ],
);

export type SaleB2cTbPriceList = typeof sale_b2c_tb_price_lists.$inferSelect;
export type NewSaleB2cTbPriceList = typeof sale_b2c_tb_price_lists.$inferInsert;
