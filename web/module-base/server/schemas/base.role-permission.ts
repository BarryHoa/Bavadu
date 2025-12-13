import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { base_tb_permissions } from "./base.permission";
import { base_tb_roles } from "./base.role";
import { mdBaseSchema } from "./schema";

// Role Permissions - Default permissions by role
// Maps roles to their default permissions
export const base_tb_role_permissions = mdBaseSchema.table(
  "role_permissions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    roleId: uuid("role_id")
      .notNull()
      .references(() => base_tb_roles.id, { onDelete: "cascade" }),

    // Permission key (string) - e.g., 'hrm.employee.view', 'hrm.employee.create'
    // Can reference base_tb_permissions.key or be standalone
    permissionKey: varchar("permission_key", { length: 100 }).notNull(),

    // Optional: reference to permission registry
    permissionId: uuid("permission_id").references(
      () => base_tb_permissions.id,
      {
        onDelete: "set null",
      }
    ),

    isActive: boolean("is_active").default(true).notNull(),

    // Audit
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    // Unique: one role can only have one instance of a permission
    uniqueIndex("role_permissions_role_key_idx").on(
      table.roleId,
      table.permissionKey
    ),
    index("role_permissions_role_idx").on(table.roleId),
    index("role_permissions_key_idx").on(table.permissionKey),
    index("role_permissions_active_idx").on(table.isActive),
  ]
);

export type BaseTbRolePermission = typeof base_tb_role_permissions.$inferSelect;
export type NewBaseTbRolePermission =
  typeof base_tb_role_permissions.$inferInsert;
