import { sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";

// HR Roles - Vai trò trong HRM
export const table_hrm_role = mdlHrmSchema.table(
  "roles",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
    permissions: jsonb("permissions").notNull(), // Array of permission strings
    isSystem: boolean("is_system").default(false).notNull(), // System roles cannot be deleted
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => []
);

export type TblHrmRole = typeof table_hrm_role.$inferSelect;
export type NewTblHrmRole = typeof table_hrm_role.$inferInsert;

