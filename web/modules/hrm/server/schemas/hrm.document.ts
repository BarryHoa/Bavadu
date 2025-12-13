import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { hrm_tb_employees } from "./hrm.employee";
import { mdlHrmSchema } from "./schema";

// Documents - Tài liệu pháp lý và hồ sơ
export const hrm_tb_documents = mdlHrmSchema.table(
  "documents",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    documentNumber: varchar("document_number", { length: 100 }).unique(),
    documentType: varchar("document_type", { length: 50 }).notNull(), // contract, amendment, certificate, id_card, etc.
    title: jsonb("title").notNull(), // LocaleDataType<string>
    description: text("description"), // Text description
    employeeId: uuid("employee_id").references(() => hrm_tb_employees.id, {
      onDelete: "cascade",
    }),
    fileUrl: varchar("file_url", { length: 500 }).notNull(),
    fileSize: integer("file_size"), // bytes
    mimeType: varchar("mime_type", { length: 100 }),
    signedDate: timestamp("signed_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    isDigitalSignature: boolean("is_digital_signature")
      .default(false)
      .notNull(),
    metadata: jsonb("metadata"), // Additional document properties
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => []
);

export type HrmTbDocument = typeof hrm_tb_documents.$inferSelect;
export type NewHrmTbDocument = typeof hrm_tb_documents.$inferInsert;
