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

// Role Permissions Default - Default permissions by role
// Định nghĩa default permissions cho mỗi role
export const base_tb_role_permissions_default = mdBaseSchema.table(
  "role_permissions_default",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    roleId: uuid("role_id")
      .notNull()
      .references(() => base_tb_roles.id, { onDelete: "cascade" }),

    permissionId: uuid("permission_id")
      .notNull()
      .references(() => base_tb_permissions.id, { onDelete: "cascade" }),

    isActive: boolean("is_active").default(true).notNull(),

    // Audit
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    // Unique: one role can only have one instance of a permission
    uniqueIndex("role_permissions_default_role_permission_idx").on(
      table.roleId,
      table.permissionId,
    ),
    index("role_permissions_default_role_idx").on(table.roleId),
    index("role_permissions_default_permission_idx").on(table.permissionId),
    index("role_permissions_default_active_idx").on(table.isActive),
  ],
);

export type BaseTbRolePermissionsDefault =
  typeof base_tb_role_permissions_default.$inferSelect;
export type NewBaseTbRolePermissionsDefault =
  typeof base_tb_role_permissions_default.$inferInsert;
