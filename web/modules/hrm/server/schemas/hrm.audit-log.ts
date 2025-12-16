import { sql } from "drizzle-orm";
import { jsonb, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { mdlHrmSchema } from "./schema";

// Audit Log - Nhật ký kiểm toán cho compliance
export const hrm_tb_audit_logs = mdlHrmSchema.table(
  "audit_logs",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    entityType: varchar("entity_type", { length: 50 }).notNull(), // employee, contract, salary, etc.
    entityId: uuid("entity_id").notNull(),
    action: varchar("action", { length: 50 }).notNull(), // create, update, delete, view, approve, reject
    performedBy: uuid("performed_by").notNull(), // Employee ID
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 500 }),
    changes: jsonb("changes"), // Before/after values for updates
    metadata: jsonb("metadata"), // Additional context
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [],
);

export type HrmTbAuditLog = typeof hrm_tb_audit_logs.$inferSelect;
export type NewHrmTbAuditLog = typeof hrm_tb_audit_logs.$inferInsert;
