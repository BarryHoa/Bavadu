import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { base_tb_roles } from "./base.role";
import { base_tb_users } from "./base.user";
import { mdBaseSchema } from "./schema";

// User-Role mapping - Link users with roles
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

    // Optional: scope to specific module or resource
    scope: jsonb("scope"), // { module: 'hrm', departmentId: 'xxx' } hoặc null = global

    isActive: boolean("is_active").default(true).notNull(),

    // Audit
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow(),
    assignedBy: varchar("assigned_by", { length: 36 }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedBy: varchar("revoked_by", { length: 36 }),
  },
  (table) => [
    index("user_roles_user_idx").on(table.userId),
    index("user_roles_role_idx").on(table.roleId),
    uniqueIndex("user_roles_user_role_idx").on(table.userId, table.roleId),
    index("user_roles_active_idx").on(table.isActive),
  ]
);

export type BaseTbUserRole = typeof base_tb_user_roles.$inferSelect;
export type NewBaseTbUserRole = typeof base_tb_user_roles.$inferInsert;
