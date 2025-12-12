import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Payroll Rules - Quy tắc tính lương (compliance rules)
export const table_payroll_rule = pgTable(
  "hrm_payroll_rules",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
    ruleType: varchar("rule_type", { length: 50 }).notNull(), // min_wage, ot_limit, tax_bracket, insurance_rate, etc.
    ruleConfig: jsonb("rule_config").notNull(), // Rule configuration (e.g., { minWage: 5000000, region: "region_1" })
    effectiveDate: date("effective_date").notNull(),
    expiryDate: date("expiry_date"), // null = no expiry
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("hrm_payroll_rules_code_idx").on(table.code),
    index("hrm_payroll_rules_type_idx").on(table.ruleType),
    index("hrm_payroll_rules_active_idx").on(table.isActive),
    index("hrm_payroll_rules_dates_idx").on(table.effectiveDate, table.expiryDate),
  ]
);

export type TblPayrollRule = typeof table_payroll_rule.$inferSelect;
export type NewTblPayrollRule = typeof table_payroll_rule.$inferInsert;

