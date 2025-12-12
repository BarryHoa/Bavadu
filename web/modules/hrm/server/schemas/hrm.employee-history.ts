import { sql } from "drizzle-orm";
import {
  date,
  index,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";
import { table_employee } from "./hrm.employee";

// Employee History - Lịch sử thay đổi nhân viên
export const table_employee_history = mdlHrmSchema.table(
  "employee_history",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    changeType: varchar("change_type", { length: 50 }).notNull(), // position_change, department_change, salary_change, status_change, contract_change
    effectiveDate: date("effective_date").notNull(),
    previousValue: jsonb("previous_value"), // Previous state
    newValue: jsonb("new_value"), // New state
    reason: text("reason"), // Lý do thay đổi
    approvedBy: uuid("approved_by"), // Employee ID who approved
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    index("employee_history_employee_idx").on(table.employeeId),
    index("employee_history_type_idx").on(table.changeType),
    index("employee_history_date_idx").on(table.effectiveDate),
  ]
);

export type TblEmployeeHistory = typeof table_employee_history.$inferSelect;
export type NewTblEmployeeHistory = typeof table_employee_history.$inferInsert;

