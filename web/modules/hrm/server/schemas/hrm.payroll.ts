import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";
import { hrm_tb_employees } from "./hrm.employee";
import { hrm_tb_payrolls_period } from "./hrm.payroll-period";

// Payroll - Bảng lương
export const hrm_tb_payrolls = mdlHrmSchema.table(
  "payrolls",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    payrollPeriodId: uuid("payroll_period_id")
      .references(() => hrm_tb_payrolls_period.id, { onDelete: "restrict" })
      .notNull(),
    employeeId: uuid("employee_id")
      .references(() => hrm_tb_employees.id, { onDelete: "restrict" })
      .notNull(),
    // Earnings - Thu nhập
    baseSalary: integer("base_salary").notNull(),
    allowances: jsonb("allowances"), // { type: amount } e.g., { "transport": 500000, "meal": 300000 }
    overtimePay: integer("overtime_pay").default(0),
    bonuses: integer("bonuses").default(0),
    otherEarnings: integer("other_earnings").default(0),
    grossSalary: integer("gross_salary").notNull(), // Total before deductions
    // Deductions - Khấu trừ
    socialInsurance: integer("social_insurance").default(0), // BHXH
    healthInsurance: integer("health_insurance").default(0), // BHYT
    unemploymentInsurance: integer("unemployment_insurance").default(0), // BHTN
    personalIncomeTax: integer("personal_income_tax").default(0), // Thuế TNCN
    otherDeductions: jsonb("other_deductions"), // { type: amount }
    totalDeductions: integer("total_deductions").default(0),
    netSalary: integer("net_salary").notNull(), // Final amount to pay
    // Working days/hours
    workingDays: integer("working_days").default(0),
    workingHours: integer("working_hours").default(0),
    overtimeHours: integer("overtime_hours").default(0),
    // Status
    status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, calculated, approved, paid
    notes: varchar("notes", { length: 1000 }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("payrolls_period_idx").on(table.payrollPeriodId),
    index("payrolls_employee_idx").on(table.employeeId),
    index("payrolls_period_employee_idx").on(
      table.payrollPeriodId,
      table.employeeId
    ),
    index("payrolls_status_idx").on(table.status),
  ]
);

export type HrmTbPayroll = typeof hrm_tb_payrolls.$inferSelect;
export type NewHrmTbPayroll = typeof hrm_tb_payrolls.$inferInsert;
