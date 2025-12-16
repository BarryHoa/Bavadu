import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdlHrmSchema } from "./schema";
import { hrm_tb_employees } from "./hrm.employee";

// Onboarding Checklists - Checklist onboarding
export const hrm_tb_onboarding_checklists = mdlHrmSchema.table(
  "onboarding_checklists",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => hrm_tb_employees.id, { onDelete: "cascade" })
      .notNull(),
    taskName: jsonb("task_name").notNull(), // LocaleDataType<string>
    taskDescription: text("task_description"), // Text description
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
    index("onboarding_checklists_employee_idx").on(table.employeeId),
    index("onboarding_checklists_assigned_idx").on(table.assignedTo),
    index("onboarding_checklists_completed_idx").on(table.isCompleted),
  ],
);

export type HrmTbOnboardingChecklist =
  typeof hrm_tb_onboarding_checklists.$inferSelect;
export type NewHrmTbOnboardingChecklist =
  typeof hrm_tb_onboarding_checklists.$inferInsert;
