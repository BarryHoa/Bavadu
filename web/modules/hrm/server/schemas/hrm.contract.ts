import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { hrm_tb_employees } from "./hrm.employee";
import { mdlHrmSchema } from "./schema";

// Contracts - Hợp đồng lao động
export const hrm_tb_contracts = mdlHrmSchema.table(
  "contracts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    contractNumber: varchar("contract_number", { length: 100 })
      .notNull()
      .unique(), // Số hợp đồng
    employeeId: uuid("employee_id")
      .references(() => hrm_tb_employees.id, { onDelete: "restrict" })
      .notNull(),
    contractType: varchar("contract_type", { length: 50 }).notNull(), // probation, fixed_term, indefinite, part_time
    startDate: date("start_date").notNull(),
    endDate: date("end_date"), // null for indefinite contracts
    baseSalary: integer("base_salary").notNull(),
    currency: varchar("currency", { length: 10 }).default("VND"),
    workingHours: integer("working_hours").default(40), // Số giờ làm việc/tuần
    probationPeriod: integer("probation_period"), // Thời gian thử việc (ngày)
    probationEndDate: date("probation_end_date"),
    status: varchar("status", { length: 50 }).notNull().default("active"), // draft, active, expired, terminated
    documentUrl: varchar("document_url", { length: 500 }), // Link to contract document
    signedDate: date("signed_date"), // Ngày ký
    signedBy: uuid("signed_by").references(() => hrm_tb_employees.id), // Employee ID who signed
    notes: text("notes"),
    metadata: jsonb("metadata"), // Additional contract terms, allowances, etc.
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("contracts_number_idx").on(table.contractNumber),
    index("contracts_employee_idx").on(table.employeeId),
    index("contracts_type_idx").on(table.contractType),
    index("contracts_status_idx").on(table.status),
    index("contracts_dates_idx").on(table.startDate, table.endDate),
    index("contracts_active_idx").on(table.isActive),
  ],
);

export type HrmTbContract = typeof hrm_tb_contracts.$inferSelect;
export type NewHrmTbContract = typeof hrm_tb_contracts.$inferInsert;
