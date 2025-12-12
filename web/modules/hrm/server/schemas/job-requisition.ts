import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_department } from "./department";
import { table_position } from "./position";

// Job Requisitions - Yêu cầu tuyển dụng
export const table_job_requisition = pgTable(
  "hrm_job_requisitions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    requisitionNumber: varchar("requisition_number", { length: 100 }).notNull().unique(),
    title: jsonb("title").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
    departmentId: uuid("department_id")
      .references(() => table_department.id, { onDelete: "restrict" })
      .notNull(),
    positionId: uuid("position_id")
      .references(() => table_position.id, { onDelete: "restrict" })
      .notNull(),
    numberOfOpenings: integer("number_of_openings").default(1).notNull(),
    priority: varchar("priority", { length: 50 }).default("normal"), // low, normal, high, urgent
    employmentType: varchar("employment_type", { length: 50 }), // full_time, part_time, contract, intern
    minSalary: integer("min_salary"),
    maxSalary: integer("max_salary"),
    currency: varchar("currency", { length: 10 }).default("VND"),
    requirements: text("requirements"), // Job requirements
    status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, open, closed, cancelled
    openedDate: date("opened_date"),
    closedDate: date("closed_date"),
    hiringManagerId: uuid("hiring_manager_id"), // Employee ID
    recruiterId: uuid("recruiter_id"), // Employee ID
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("hrm_job_requisitions_number_idx").on(table.requisitionNumber),
    index("hrm_job_requisitions_department_idx").on(table.departmentId),
    index("hrm_job_requisitions_position_idx").on(table.positionId),
    index("hrm_job_requisitions_status_idx").on(table.status),
  ]
);

export type TblJobRequisition = typeof table_job_requisition.$inferSelect;
export type NewTblJobRequisition = typeof table_job_requisition.$inferInsert;

