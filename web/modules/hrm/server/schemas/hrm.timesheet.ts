import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";
import { hrm_tb_employees } from "./hrm.employee";
import { hrm_tb_rosters } from "./hrm.roster";
import { hrm_tb_shifts } from "./hrm.shift";

// Timesheet - Chấm công
export const hrm_tb_timesheets = mdlHrmSchema.table(
  "timesheets",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => hrm_tb_employees.id, { onDelete: "cascade" })
      .notNull(),
    rosterId: uuid("roster_id").references(() => hrm_tb_rosters.id, {
      onDelete: "set null",
    }),
    workDate: date("work_date").notNull(),
    shiftId: uuid("shift_id").references(() => hrm_tb_shifts.id, {
      onDelete: "set null",
    }),
    checkInTime: timestamp("check_in_time", { withTimezone: true }),
    checkOutTime: timestamp("check_out_time", { withTimezone: true }),
    actualHours: integer("actual_hours"), // Calculated from check in/out
    regularHours: integer("regular_hours"), // Regular working hours
    overtimeHours: integer("overtime_hours").default(0), // OT hours
    breakDuration: integer("break_duration").default(0), // Minutes
    status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
    checkInMethod: varchar("check_in_method", { length: 50 }), // web, mobile, kiosk
    checkOutMethod: varchar("check_out_method", { length: 50 }),
    checkInLocation: varchar("check_in_location", { length: 255 }),
    checkOutLocation: varchar("check_out_location", { length: 255 }),
    notes: varchar("notes", { length: 500 }),
    approvedBy: uuid("approved_by"), // Employee ID
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("timesheets_employee_idx").on(table.employeeId),
    index("timesheets_date_idx").on(table.workDate),
    index("timesheets_employee_date_idx").on(
      table.employeeId,
      table.workDate
    ),
    index("timesheets_status_idx").on(table.status),
  ]
);

export type HrmTbTimesheet = typeof hrm_tb_timesheets.$inferSelect;
export type NewHrmTbTimesheet = typeof hrm_tb_timesheets.$inferInsert;
