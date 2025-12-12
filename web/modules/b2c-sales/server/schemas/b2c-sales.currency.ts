import { sql } from "drizzle-orm";
import {
  index,
  numeric,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlSaleB2cSchema } from "./schema";

// Currency Rate Snapshot - Store exchange rate at order creation time
export const table_order_currency_rate = mdlSaleB2cSchema.table(
  "currency_rates",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    orderType: varchar("order_type", { length: 10 }).notNull(), // 'B2B' | 'B2C'
    orderId: uuid("order_id").notNull(),
    currencyCode: varchar("currency_code", { length: 8 }).notNull(),
    exchangeRate: numeric("exchange_rate", { precision: 14, scale: 6 }).notNull(),
    rateDate: timestamp("rate_date", { withTimezone: true }).notNull(),
    source: varchar("source", { length: 50 }), // Source of the rate (e.g., 'manual', 'api')
    note: varchar("note", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("currency_rates_order_idx").on(table.orderType, table.orderId),
    index("currency_rates_currency_idx").on(table.currencyCode),
    index("currency_rates_date_idx").on(table.rateDate),
  ]
);

export type TblOrderCurrencyRate = typeof table_order_currency_rate.$inferSelect;
export type NewTblOrderCurrencyRate = typeof table_order_currency_rate.$inferInsert;

