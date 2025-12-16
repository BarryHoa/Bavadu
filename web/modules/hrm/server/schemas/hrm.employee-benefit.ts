import { sql } from "drizzle-orm";
import { date, index, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { mdlHrmSchema } from "./schema";
import { hrm_tb_benefit_packages } from "./hrm.benefit-package";
import { hrm_tb_employees } from "./hrm.employee";

// Employee Benefits - Phúc lợi của nhân viên
export const hrm_tb_employees_benefit = mdlHrmSchema.table(
  "employee_benefits",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => hrm_tb_employees.id, { onDelete: "cascade" })
      .notNull(),
    benefitPackageId: uuid("benefit_package_id")
      .references(() => hrm_tb_benefit_packages.id, { onDelete: "restrict" })
      .notNull(),
    effectiveDate: date("effective_date").notNull(),
    expiryDate: date("expiry_date"), // null = no expiry
    enrollmentDate: date("enrollment_date"),
    status: varchar("status", { length: 50 }).notNull().default("active"), // active, suspended, terminated
    lifeEventType: varchar("life_event_type", { length: 50 }), // marriage, birth, etc. - triggers enrollment
    notes: varchar("notes", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("employee_benefits_employee_idx").on(table.employeeId),
    index("employee_benefits_package_idx").on(table.benefitPackageId),
    index("employee_benefits_status_idx").on(table.status),
    index("employee_benefits_dates_idx").on(
      table.effectiveDate,
      table.expiryDate,
    ),
  ],
);

export type HrmTbEmployeeBenefit = typeof hrm_tb_employees_benefit.$inferSelect;
export type NewHrmTbEmployeeBenefit =
  typeof hrm_tb_employees_benefit.$inferInsert;
