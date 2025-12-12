import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { hrm_tb_job_requisitions } from "./hrm.job-requisition";
import { mdlHrmSchema } from "./schema";

// Candidates - Ứng viên
export const hrm_tb_candidates = mdlHrmSchema.table(
  "candidates",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    requisitionId: uuid("requisition_id")
      .references(() => hrm_tb_job_requisitions.id, { onDelete: "restrict" })
      .notNull(),
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    fullName: jsonb("full_name").notNull(), // LocaleDataType<string>
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    dateOfBirth: date("date_of_birth"),
    gender: varchar("gender", { length: 20 }),
    address: jsonb("address"),
    cvUrl: varchar("cv_url", { length: 500 }), // Link to CV document
    coverLetter: text("cover_letter"),
    source: varchar("source", { length: 100 }), // referral, job_board, website, etc.
    status: varchar("status", { length: 50 }).notNull().default("applied"), // applied, screening, interview, offer, hired, rejected, withdrawn
    stage: varchar("stage", { length: 50 }), // resume_review, phone_screen, technical_interview, final_interview, etc.
    rating: integer("rating"), // 1-5 rating
    notes: text("notes"),
    appliedDate: timestamp("applied_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("candidates_requisition_idx").on(table.requisitionId),
    index("candidates_status_idx").on(table.status),
    index("candidates_email_idx").on(table.email),
  ]
);

export type HrmTbCandidate = typeof hrm_tb_candidates.$inferSelect;
export type NewHrmTbCandidate = typeof hrm_tb_candidates.$inferInsert;
