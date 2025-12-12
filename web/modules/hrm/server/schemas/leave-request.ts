import { sql } from "drizzle-orm";
import {
  date,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_employee } from "./employee";
import { table_leave_type } from "./leave-type";

// Leave Requests - Đơn xin nghỉ phép
export const table_leave_request = pgTable(
  "hrm_leave_requests",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    leaveTypeId: uuid("leave_type_id")
      .references(() => table_leave_type.id, { onDelete: "restrict" })
      .notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    days: integer("days").notNull(), // Number of days requested
    reason: text("reason"),
    status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected, cancelled
    workflowInstanceId: uuid("workflow_instance_id"), // Link to workflow if approval needed
    approvedBy: uuid("approved_by"), // Employee ID
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedBy: uuid("rejected_by"),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("hrm_leave_requests_employee_idx").on(table.employeeId),
    index("hrm_leave_requests_type_idx").on(table.leaveTypeId),
    index("hrm_leave_requests_status_idx").on(table.status),
    index("hrm_leave_requests_dates_idx").on(table.startDate, table.endDate),
  ]
);

export type TblLeaveRequest = typeof table_leave_request.$inferSelect;
export type NewTblLeaveRequest = typeof table_leave_request.$inferInsert;

