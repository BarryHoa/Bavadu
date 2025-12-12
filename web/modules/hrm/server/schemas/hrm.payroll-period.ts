import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";

// Payroll Periods - Kỳ lương
export const hrm_tb_payrolls_period = mdlHrmSchema.table(
  "payroll_periods",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 100 }).notNull().unique(), // e.g., "2024-01"
    name: varchar("name", { length: 255 }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    payDate: date("pay_date").notNull(), // Date to pay employees
    status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, processing, completed, locked
    isLocked: boolean("is_locked").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("payroll_periods_code_idx").on(table.code),
    index("payroll_periods_dates_idx").on(table.startDate, table.endDate),
    index("payroll_periods_status_idx").on(table.status),
  ]
);

export type HrmTbPayrollPeriod = typeof hrm_tb_payrolls_period.$inferSelect;
export type NewHrmTbPayrollPeriod = typeof hrm_tb_payrolls_period.$inferInsert;

