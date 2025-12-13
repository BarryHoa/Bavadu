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
import { base_tb_users } from "./base.user";
import { mdBaseSchema } from "./schema";

// User Permissions - Permissions bổ sung cho user
// Định nghĩa user có thêm những permissions nào ngoài permissions từ roles
export const base_tb_user_permissions = mdBaseSchema.table(
  "user_permissions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    userId: uuid("user_id")
      .notNull()
      .references(() => base_tb_users.id, { onDelete: "cascade" }),

    permissionId: uuid("permission_id")
      .notNull()
      .references(() => base_tb_permissions.id, { onDelete: "cascade" }),

    isActive: boolean("is_active").default(true).notNull(),

    // Audit
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    // Unique: one user can only have one instance of a permission
    uniqueIndex("user_permissions_user_permission_idx").on(
      table.userId,
      table.permissionId
    ),
    index("user_permissions_user_idx").on(table.userId),
    index("user_permissions_permission_idx").on(table.permissionId),
    index("user_permissions_active_idx").on(table.isActive),
  ]
);

export type BaseTbUserPermissions = typeof base_tb_user_permissions.$inferSelect;
export type NewBaseTbUserPermissions =
  typeof base_tb_user_permissions.$inferInsert;

