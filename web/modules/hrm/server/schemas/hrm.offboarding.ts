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

import { base_tb_users } from "@base/server/schemas/base.user";

import { mdlHrmSchema } from "./schema";

// Offboarding - Quy trình nghỉ việc
export const hrm_tb_offboardings = mdlHrmSchema.table(
  "offboarding",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    userId: uuid("user_id")
      .references(() => base_tb_users.id, { onDelete: "cascade" })
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
    index("offboarding_user_idx").on(table.userId),
    index("offboarding_status_idx").on(table.status),
  ],
);

export type HrmTbOffboarding = typeof hrm_tb_offboardings.$inferSelect;
export type NewHrmTbOffboarding = typeof hrm_tb_offboardings.$inferInsert;
