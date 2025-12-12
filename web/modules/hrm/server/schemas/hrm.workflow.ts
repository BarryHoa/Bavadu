import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";

// Workflow Definitions - Định nghĩa quy trình
export const table_workflow = mdlHrmSchema.table(
  "workflows",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
    workflowType: varchar("workflow_type", { length: 50 }).notNull(), // leave_request, overtime, salary_change, contract_approval, etc.
    steps: jsonb("steps").notNull(), // Array of workflow steps with approvers
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => []
);

export type TblWorkflow = typeof table_workflow.$inferSelect;
export type NewTblWorkflow = typeof table_workflow.$inferInsert;

// Workflow Instances - Phiên bản quy trình đang chạy
export const table_workflow_instance = mdlHrmSchema.table(
  "workflow_instances",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    workflowId: uuid("workflow_id")
      .references(() => table_workflow.id, { onDelete: "restrict" })
      .notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(), // leave, overtime, contract, etc.
    entityId: uuid("entity_id").notNull(), // ID of the entity being processed
    currentStep: integer("current_step").default(0).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected, cancelled
    initiatedBy: uuid("initiated_by").notNull(), // Employee ID
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => []
);

export type TblWorkflowInstance = typeof table_workflow_instance.$inferSelect;
export type NewTblWorkflowInstance = typeof table_workflow_instance.$inferInsert;

// Workflow Approvals - Phê duyệt từng bước
export const table_workflow_approval = mdlHrmSchema.table(
  "workflow_approvals",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    instanceId: uuid("instance_id")
      .references(() => table_workflow_instance.id, { onDelete: "cascade" })
      .notNull(),
    step: integer("step").notNull(),
    approverId: uuid("approver_id").notNull(), // Employee ID
    status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
    comments: varchar("comments", { length: 1000 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }),
  },
  (table) => []
);

export type TblWorkflowApproval = typeof table_workflow_approval.$inferSelect;
export type NewTblWorkflowApproval = typeof table_workflow_approval.$inferInsert;

