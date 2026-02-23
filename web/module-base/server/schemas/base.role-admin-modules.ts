import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { base_tb_roles } from "./base.role";
import { mdBaseSchema } from "./schema";

/**
 * Role Admin Modules - Admin scope per role (hierarchical: module → resource).
 * Thay thế is_admin_modules JSONB trên roles, cho phép admin từng cấp: hrm, hrm.timesheet, hrm.payroll...
 */
export const base_tb_role_admin_modules = mdBaseSchema.table(
  "role_admin_modules",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    roleId: uuid("role_id")
      .notNull()
      .references(() => base_tb_roles.id, { onDelete: "cascade" }),

    /** Scope phân cấp: 'hrm', 'hrm.timesheet', 'hrm.payroll', ... */
    scope: varchar("scope", { length: 100 }).notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    uniqueIndex("role_admin_modules_role_scope_idx").on(table.roleId, table.scope),
    index("role_admin_modules_role_idx").on(table.roleId),
    index("role_admin_modules_scope_idx").on(table.scope),
    index("role_admin_modules_active_idx").on(table.isActive),
  ],
);

export type BaseTbRoleAdminModule =
  typeof base_tb_role_admin_modules.$inferSelect;
export type NewBaseTbRoleAdminModule =
  typeof base_tb_role_admin_modules.$inferInsert;
