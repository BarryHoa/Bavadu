import { sql } from "drizzle-orm";
import {
  date,
  index,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";
import { table_benefit_package } from "./hrm.benefit-package";
import { table_employee } from "./hrm.employee";

// Employee Benefits - Phúc lợi của nhân viên
export const table_employee_benefit = mdlHrmSchema.table(
  "employee_benefits",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    benefitPackageId: uuid("benefit_package_id")
      .references(() => table_benefit_package.id, { onDelete: "restrict" })
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
    index("employee_benefits_dates_idx").on(table.effectiveDate, table.expiryDate),
  ]
);

export type TblEmployeeBenefit = typeof table_employee_benefit.$inferSelect;
export type NewTblEmployeeBenefit = typeof table_employee_benefit.$inferInsert;

