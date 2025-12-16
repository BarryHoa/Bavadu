import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdlHrmSchema } from "./schema";
import { hrm_tb_employees } from "./hrm.employee";
import { hrm_tb_leave_types } from "./hrm.leave-type";

// Leave Requests - Đơn xin nghỉ phép
export const hrm_tb_leave_requests = mdlHrmSchema.table(
  "leave_requests",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => hrm_tb_employees.id, { onDelete: "cascade" })
      .notNull(),
    leaveTypeId: uuid("leave_type_id")
      .references(() => hrm_tb_leave_types.id, { onDelete: "restrict" })
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
    index("leave_requests_employee_idx").on(table.employeeId),
    index("leave_requests_type_idx").on(table.leaveTypeId),
    index("leave_requests_status_idx").on(table.status),
    index("leave_requests_dates_idx").on(table.startDate, table.endDate),
  ],
);

export type HrmTbLeaveRequest = typeof hrm_tb_leave_requests.$inferSelect;
export type NewHrmTbLeaveRequest = typeof hrm_tb_leave_requests.$inferInsert;
