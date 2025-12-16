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

import { mdlHrmSchema } from "./schema";

// Workflow Definitions - Định nghĩa quy trình
export const hrm_tb_workflows = mdlHrmSchema.table(
  "workflows",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: text("description"), // Text description
    workflowType: varchar("workflow_type", { length: 50 }).notNull(), // leave_request, overtime, salary_change, contract_approval, etc.
    steps: jsonb("steps").notNull(), // Array of workflow steps with approvers
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [],
);

export type HrmTbWorkflow = typeof hrm_tb_workflows.$inferSelect;
export type NewHrmTbWorkflow = typeof hrm_tb_workflows.$inferInsert;

// Workflow Instances - Phiên bản quy trình đang chạy
export const hrm_tb_workflows_instance = mdlHrmSchema.table(
  "workflow_instances",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    workflowId: uuid("workflow_id")
      .references(() => hrm_tb_workflows.id, { onDelete: "restrict" })
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
  (table) => [],
);

export type HrmTbWorkflowInstance =
  typeof hrm_tb_workflows_instance.$inferSelect;
export type NewHrmTbWorkflowInstance =
  typeof hrm_tb_workflows_instance.$inferInsert;

// Workflow Approvals - Phê duyệt từng bước
export const hrm_tb_workflows_approval = mdlHrmSchema.table(
  "workflow_approvals",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    instanceId: uuid("instance_id")
      .references(() => hrm_tb_workflows_instance.id, { onDelete: "cascade" })
      .notNull(),
    step: integer("step").notNull(),
    approverId: uuid("approver_id").notNull(), // Employee ID
    status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
    comments: varchar("comments", { length: 1000 }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }),
  },
  (table) => [],
);

export type HrmTbWorkflowApproval =
  typeof hrm_tb_workflows_approval.$inferSelect;
export type NewHrmTbWorkflowApproval =
  typeof hrm_tb_workflows_approval.$inferInsert;
