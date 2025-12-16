import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdlHrmSchema } from "./schema";
import { hrm_tb_candidates } from "./hrm.candidate";
import { hrm_tb_employees } from "./hrm.employee";

// Interviews - Phỏng vấn
export const hrm_tb_interviews = mdlHrmSchema.table(
  "interviews",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    candidateId: uuid("candidate_id")
      .references(() => hrm_tb_candidates.id, { onDelete: "cascade" })
      .notNull(),
    interviewType: varchar("interview_type", { length: 50 }).notNull(), // phone_screen, technical, final, etc.
    scheduledDate: timestamp("scheduled_date", {
      withTimezone: true,
    }).notNull(),
    duration: integer("duration"), // Minutes
    location: varchar("location", { length: 255 }), // Physical location or video link
    interviewerIds: jsonb("interviewer_ids").notNull(), // Array of employee IDs
    status: varchar("status", { length: 50 }).notNull().default("scheduled"), // scheduled, completed, cancelled, rescheduled
    feedback: text("feedback"),
    rating: integer("rating"), // 1-5 rating
    recommendation: varchar("recommendation", { length: 50 }), // hire, no_hire, maybe
    notes: text("notes"),
    conductedBy: uuid("conducted_by").references(() => hrm_tb_employees.id),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("interviews_candidate_idx").on(table.candidateId),
    index("interviews_status_idx").on(table.status),
    index("interviews_date_idx").on(table.scheduledDate),
  ],
);

export type HrmTbInterview = typeof hrm_tb_interviews.$inferSelect;
export type NewHrmTbInterview = typeof hrm_tb_interviews.$inferInsert;
