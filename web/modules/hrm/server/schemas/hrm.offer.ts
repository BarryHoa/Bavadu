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
import { mdlHrmSchema } from "./schema";
import { hrm_tb_candidates } from "./hrm.candidate";
import { hrm_tb_employees } from "./hrm.employee";

// Offers - Đề nghị làm việc
export const hrm_tb_offers = mdlHrmSchema.table(
  "offers",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    candidateId: uuid("candidate_id")
      .references(() => hrm_tb_candidates.id, { onDelete: "restrict" })
      .notNull(),
    offerNumber: varchar("offer_number", { length: 100 }).notNull().unique(),
    positionTitle: jsonb("position_title").notNull(), // LocaleDataType<string>
    baseSalary: integer("base_salary").notNull(),
    currency: varchar("currency", { length: 10 }).default("VND"),
    startDate: date("start_date").notNull(),
    employmentType: varchar("employment_type", { length: 50 }), // full_time, part_time, contract
    benefits: jsonb("benefits"), // Additional benefits offered
    terms: text("terms"), // Offer terms and conditions
    status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, sent, accepted, rejected, expired, withdrawn
    sentDate: timestamp("sent_date", { withTimezone: true }),
    expiryDate: date("expiry_date"),
    acceptedDate: timestamp("accepted_date", { withTimezone: true }),
    rejectedDate: timestamp("rejected_date", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
    approvedBy: uuid("approved_by").references(() => hrm_tb_employees.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("offers_candidate_idx").on(table.candidateId),
    index("offers_number_idx").on(table.offerNumber),
    index("offers_status_idx").on(table.status),
  ]
);

export type HrmTbOffer = typeof hrm_tb_offers.$inferSelect;
export type NewHrmTbOffer = typeof hrm_tb_offers.$inferInsert;

