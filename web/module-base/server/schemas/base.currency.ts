import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  index,
  jsonb,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdBaseSchema } from "./schema";

/**
 * Currency table - Quản lý các loại tiền tệ trong hệ thống
 *
 * Lưu ý: Tất cả tỷ giá trong hệ thống đều được quy đổi về VND
 * - VND luôn có tỷ giá = 1.0 (phải được đảm bảo ở application level)
 * - Các currency khác: tỷ giá = số VND tương ứng với 1 đơn vị currency đó
 *   Ví dụ: USD = 24500 VND, EUR = 26500 VND
 */
export const table_currency = mdBaseSchema.table(
  "currencies",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`), // UUID v7
    code: varchar("code", { length: 3 }).notNull().unique(), // ISO currency code: USD, VND, EUR, etc.
    name: jsonb("name").notNull(), // LocaleDataType<string> - Tên tiền tệ đa ngôn ngữ
    symbol: varchar("symbol", { length: 10 }), // Ký hiệu: $, ₫, €, etc.
    decimalPlaces: decimal("decimal_places", {
      precision: 1,
      scale: 0,
    })
      .default("2")
      .notNull(), // Số chữ số thập phân (thường là 2, VND là 0)
    isDefault: boolean("is_default").default(false).notNull(), // Đánh dấu currency mặc định của hệ thống (thường là VND)
    isActive: boolean("is_active").default(true).notNull(), // Trạng thái hoạt động
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }), // uuid user id
    updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
  },
  (table) => [
    index("currencies_code_idx").on(table.code),
    index("currencies_is_default_idx").on(table.isDefault),
    index("currencies_is_active_idx").on(table.isActive),
    // Composite index for common queries
    index("currencies_default_active_idx").on(table.isDefault, table.isActive),
  ]
);

export type TblCurrency = typeof table_currency.$inferSelect;
export type NewTblCurrency = typeof table_currency.$inferInsert;

/**
 * Currency Exchange Rates - Lưu lịch sử tỷ giá theo ngày
 *
 * Tỷ giá luôn được quy đổi về VND:
 * - 1 đơn vị currency = bao nhiêu VND
 * - VND luôn có tỷ giá = 1.0 cho mọi ngày
 * - Ví dụ: USD ngày 2024-01-01 = 24500, EUR ngày 2024-01-01 = 26500
 */
export const table_currency_exchange_rate = mdBaseSchema.table(
  "currency_exchange_rate_for_vnd",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`), // UUID v7
    currencyId: uuid("currency_id")
      .notNull()
      .references(() => table_currency.id, { onDelete: "cascade" }), // Reference đến currency
    rateDate: date("rate_date").notNull(), // Ngày của tỷ giá
    exchangeRate: decimal("exchange_rate", {
      precision: 18,
      scale: 8,
    }).notNull(), // Tỷ giá quy đổi về VND (1 đơn vị currency = bao nhiêu VND). VND luôn có tỷ giá = 1.0
    source: varchar("source", { length: 100 }), // Nguồn tỷ giá: "manual", "api", "bank", etc.
    note: text("note"), // Ghi chú về tỷ giá
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }), // uuid user id
    updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
  },
  (table) => [
    // Unique constraint: mỗi currency chỉ có một tỷ giá mỗi ngày
    uniqueIndex("currency_exchange_rate_for_vnd_currency_date_unique").on(
      table.currencyId,
      table.rateDate
    ),
    index("currency_exchange_rate_for_vnd_currency_idx").on(table.currencyId),
    index("currency_exchange_rate_for_vnd_date_idx").on(table.rateDate),
    // Composite index for common queries: get rate by currency and date range
    index("currency_exchange_rate_for_vnd_currency_date_idx").on(
      table.currencyId,
      table.rateDate
    ),
  ]
);

export type TblCurrencyExchangeRate =
  typeof table_currency_exchange_rate.$inferSelect;
export type NewTblCurrencyExchangeRate =
  typeof table_currency_exchange_rate.$inferInsert;
