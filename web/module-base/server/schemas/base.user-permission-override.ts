import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdBaseSchema } from "./schema";
import { base_tb_users } from "./base.user";

// User Permission Override - Overwrite permissions for specific users
// Allows customizing permissions per user beyond their role assignments
export const base_tb_user_permission_overrides = mdBaseSchema.table(
  "user_permission_overrides",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    userId: uuid("user_id")
      .notNull()
      .references(() => base_tb_users.id, { onDelete: "cascade" }),

    // Permissions to add (grant)
    grantedPermissions: jsonb("granted_permissions"), // Array of permission strings: ['hrm.employee.view', ...]

    // Permissions to remove (revoke) - takes precedence over granted
    revokedPermissions: jsonb("revoked_permissions"), // Array of permission strings: ['hrm.employee.delete', ...]

    // Optional: scope to specific module
    module: varchar("module", { length: 50 }), // null = all modules, 'hrm' = HRM only

    isActive: boolean("is_active").default(true).notNull(),

    // Audit
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("user_permission_overrides_user_idx").on(table.userId),
    index("user_permission_overrides_module_idx").on(table.module),
    index("user_permission_overrides_active_idx").on(table.isActive),
    index("user_permission_overrides_user_module_idx").on(table.userId, table.module),
  ]
);

export type BaseTbUserPermissionOverride =
  typeof base_tb_user_permission_overrides.$inferSelect;
export type NewBaseTbUserPermissionOverride =
  typeof base_tb_user_permission_overrides.$inferInsert;

