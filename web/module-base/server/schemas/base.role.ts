import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdBaseSchema } from "./schema";

// Base Roles - Core role system for entire application
// Roles định nghĩa các vai trò trong hệ thống (Guest, admin, system, etc.)
export const base_tb_roles = mdBaseSchema.table(
  "roles",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: text("description"), // Text description

    // System roles cannot be deleted
    isSystem: boolean("is_system").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),

    // Module-level admin flags, stored as JSONB: { [moduleCode]: true }
    isAdminModules: jsonb("is_admin_modules")
      .notNull()
      .$type<Record<string, boolean>>()
      .default({}),

    // Audit
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("roles_active_idx").on(table.isActive),
    index("roles_code_idx").on(table.code),
  ],
);

export type BaseTbRole = typeof base_tb_roles.$inferSelect;
export type NewBaseTbRole = typeof base_tb_roles.$inferInsert;
