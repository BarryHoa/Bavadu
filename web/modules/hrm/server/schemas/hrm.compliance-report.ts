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

// Compliance Reports - Báo cáo tuân thủ
export const table_compliance_report = mdlHrmSchema.table(
  "compliance_reports",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    reportNumber: varchar("report_number", { length: 100 }).notNull().unique(),
    reportType: varchar("report_type", { length: 50 }).notNull(), // tax, social_insurance, labor_dept, etc.
    reportingPeriod: varchar("reporting_period", { length: 50 }).notNull(), // e.g., "2024-01"
    reportDate: date("report_date").notNull(),
    submittedDate: date("submitted_date"),
    status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, submitted, approved, rejected
    fileUrl: varchar("file_url", { length: 500 }), // Link to generated report file
    data: jsonb("data"), // Report data/content
    notes: text("notes"),
    approvedBy: uuid("approved_by"), // Employee ID
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("compliance_reports_number_idx").on(table.reportNumber),
    index("compliance_reports_type_idx").on(table.reportType),
    index("compliance_reports_period_idx").on(table.reportingPeriod),
    index("compliance_reports_status_idx").on(table.status),
  ]
);

export type TblComplianceReport = typeof table_compliance_report.$inferSelect;
export type NewTblComplianceReport = typeof table_compliance_report.$inferInsert;

