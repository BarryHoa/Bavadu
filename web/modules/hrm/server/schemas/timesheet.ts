import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_employee } from "./employee";
import { table_roster } from "./roster";
import { table_shift } from "./shift";

// Timesheet - Chấm công
export const table_timesheet = pgTable(
  "hrm_timesheets",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    rosterId: uuid("roster_id").references(() => table_roster.id, {
      onDelete: "set null",
    }),
    workDate: date("work_date").notNull(),
    shiftId: uuid("shift_id").references(() => table_shift.id, {
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
    index("hrm_timesheets_employee_idx").on(table.employeeId),
    index("hrm_timesheets_date_idx").on(table.workDate),
    index("hrm_timesheets_employee_date_idx").on(
      table.employeeId,
      table.workDate
    ),
    index("hrm_timesheets_status_idx").on(table.status),
  ]
);

export type TblTimesheet = typeof table_timesheet.$inferSelect;
export type NewTblTimesheet = typeof table_timesheet.$inferInsert;
