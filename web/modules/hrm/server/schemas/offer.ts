import { sql } from "drizzle-orm";
import {
  date,
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

// Offers - Đề nghị làm việc
export const table_offer = pgTable(
  "hrm_offers",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    candidateId: uuid("candidate_id")
      .references(() => table_candidate.id, { onDelete: "restrict" })
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
    approvedBy: uuid("approved_by").references(() => table_employee.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("hrm_offers_candidate_idx").on(table.candidateId),
    index("hrm_offers_number_idx").on(table.offerNumber),
    index("hrm_offers_status_idx").on(table.status),
  ]
);

export type TblOffer = typeof table_offer.$inferSelect;
export type NewTblOffer = typeof table_offer.$inferInsert;

