import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_candidate } from "./candidate";
import { table_employee } from "./employee";

// Interviews - Phỏng vấn
export const table_interview = pgTable(
  "hrm_interviews",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    candidateId: uuid("candidate_id")
      .references(() => table_candidate.id, { onDelete: "cascade" })
      .notNull(),
    interviewType: varchar("interview_type", { length: 50 }).notNull(), // phone_screen, technical, final, etc.
    scheduledDate: timestamp("scheduled_date", { withTimezone: true }).notNull(),
    duration: integer("duration"), // Minutes
    location: varchar("location", { length: 255 }), // Physical location or video link
    interviewerIds: jsonb("interviewer_ids").notNull(), // Array of employee IDs
    status: varchar("status", { length: 50 }).notNull().default("scheduled"), // scheduled, completed, cancelled, rescheduled
    feedback: text("feedback"),
    rating: integer("rating"), // 1-5 rating
    recommendation: varchar("recommendation", { length: 50 }), // hire, no_hire, maybe
    notes: text("notes"),
    conductedBy: uuid("conducted_by").references(() => table_employee.id),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("hrm_interviews_candidate_idx").on(table.candidateId),
    index("hrm_interviews_status_idx").on(table.status),
    index("hrm_interviews_date_idx").on(table.scheduledDate),
  ]
);

export type TblInterview = typeof table_interview.$inferSelect;
export type NewTblInterview = typeof table_interview.$inferInsert;

