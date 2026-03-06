import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdlHrmSchema } from "./schema";

// Holidays - Ngày lễ
export const hrm_tb_holidays = mdlHrmSchema.table(
  "holidays",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    date: date("date").notNull(), // Ngày cụ thể (YYYY-MM-DD)
    year: integer("year"), // null = recurring yearly (cho ngày lễ cố định như 1/1, 30/4...)
    isRecurring: boolean("is_recurring").default(false).notNull(), // true = lặp lại hàng năm
    holidayType: varchar("holiday_type", { length: 50 })
      .default("national")
      .notNull(), // national, company, regional
    countryCode: varchar("country_code", { length: 10 }).default("VN"),
    isPaid: boolean("is_paid").default(true).notNull(), // Có trả lương không
    isActive: boolean("is_active").default(true).notNull(),
    description: varchar("description", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("hrm_holidays_date_idx").on(table.date),
    index("hrm_holidays_year_idx").on(table.year),
    index("hrm_holidays_type_idx").on(table.holidayType),
    index("hrm_holidays_country_idx").on(table.countryCode),
    index("hrm_holidays_active_idx").on(table.isActive),
  ],
);

export type HrmTbHoliday = typeof hrm_tb_holidays.$inferSelect;
export type NewHrmTbHoliday = typeof hrm_tb_holidays.$inferInsert;
