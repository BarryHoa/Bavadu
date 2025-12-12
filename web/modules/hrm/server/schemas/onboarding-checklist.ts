import { sql } from "drizzle-orm";
import {
  boolean,
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

// Onboarding Checklists - Checklist onboarding
export const table_onboarding_checklist = pgTable(
  "hrm_onboarding_checklists",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    taskName: jsonb("task_name").notNull(), // LocaleDataType<string>
    taskDescription: jsonb("task_description"), // LocaleDataType<string>
    category: varchar("category", { length: 50 }), // hr, it, facilities, training, etc.
    assignedTo: uuid("assigned_to"), // Employee ID responsible for this task
    dueDate: date("due_date"),
    completedDate: date("completed_date"),
    isCompleted: boolean("is_completed").default(false).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("hrm_onboarding_checklists_employee_idx").on(table.employeeId),
    index("hrm_onboarding_checklists_assigned_idx").on(table.assignedTo),
    index("hrm_onboarding_checklists_completed_idx").on(table.isCompleted),
  ]
);

export type TblOnboardingChecklist = typeof table_onboarding_checklist.$inferSelect;
export type NewTblOnboardingChecklist = typeof table_onboarding_checklist.$inferInsert;

