import { sql } from "drizzle-orm";
import {
  date,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_employee } from "./employee";

// Offboarding - Quy trình nghỉ việc
export const table_offboarding = pgTable(
  "hrm_offboarding",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    resignationDate: date("resignation_date").notNull(),
    lastWorkingDate: date("last_working_date").notNull(),
    reason: varchar("reason", { length: 50 }), // resignation, termination, retirement, etc.
    reasonDetails: text("reason_details"),
    exitInterviewDate: date("exit_interview_date"),
    exitInterviewNotes: text("exit_interview_notes"),
    handoverNotes: text("handover_notes"),
    assetsReturned: jsonb("assets_returned"), // List of assets returned
    status: varchar("status", { length: 50 }).notNull().default("initiated"), // initiated, in_progress, completed
    completedDate: date("completed_date"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("hrm_offboarding_employee_idx").on(table.employeeId),
    index("hrm_offboarding_status_idx").on(table.status),
  ]
);

export type TblOffboarding = typeof table_offboarding.$inferSelect;
export type NewTblOffboarding = typeof table_offboarding.$inferInsert;

