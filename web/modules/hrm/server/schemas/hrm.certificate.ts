import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";
import { table_employee } from "./hrm.employee";

// Certificates - Chứng chỉ
export const table_certificate = mdlHrmSchema.table(
  "certificates",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    issuer: varchar("issuer", { length: 255 }).notNull(),
    certificateNumber: varchar("certificate_number", { length: 100 }),
    issueDate: date("issue_date").notNull(),
    expiryDate: date("expiry_date"), // null = no expiry
    documentUrl: varchar("document_url", { length: 500 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("certificates_employee_idx").on(table.employeeId),
    index("certificates_expiry_idx").on(table.expiryDate),
    index("certificates_active_idx").on(table.isActive),
  ]
);

export type TblCertificate = typeof table_certificate.$inferSelect;
export type NewTblCertificate = typeof table_certificate.$inferInsert;

