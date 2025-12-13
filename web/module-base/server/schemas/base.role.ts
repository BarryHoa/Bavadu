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
// module: null = global role, 'hrm' = HRM specific role, etc.
export const base_tb_roles = mdBaseSchema.table(
  "roles",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: text("description"), // Text description

    // Permissions - Array of permission strings
    permissions: jsonb("permissions").notNull(), // ['hrm.employee.view', 'hrm.employee.create', ...]

    // System roles cannot be deleted
    isSystem: boolean("is_system").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),

    // Audit
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [index("roles_active_idx").on(table.isActive)]
);

export type BaseTbRole = typeof base_tb_roles.$inferSelect;
export type NewBaseTbRole = typeof base_tb_roles.$inferInsert;
