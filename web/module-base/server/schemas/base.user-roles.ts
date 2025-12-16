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
import { base_tb_users } from "./base.user";
import { mdBaseSchema } from "./schema";

// User Roles - Roles của mỗi user
// Định nghĩa user có những roles nào
export const base_tb_user_roles = mdBaseSchema.table(
  "user_roles",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    userId: uuid("user_id")
      .notNull()
      .references(() => base_tb_users.id, { onDelete: "cascade" }),

    roleId: uuid("role_id")
      .notNull()
      .references(() => base_tb_roles.id, { onDelete: "cascade" }),

    isActive: boolean("is_active").default(true).notNull(),

    // Audit
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    // Unique: one user can only have one instance of a role
    uniqueIndex("user_roles_user_role_idx").on(table.userId, table.roleId),
    index("user_roles_user_idx").on(table.userId),
    index("user_roles_role_idx").on(table.roleId),
    index("user_roles_active_idx").on(table.isActive),
  ],
);

export type BaseTbUserRoles = typeof base_tb_user_roles.$inferSelect;
export type NewBaseTbUserRoles = typeof base_tb_user_roles.$inferInsert;
