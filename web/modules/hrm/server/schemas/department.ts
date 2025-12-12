import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Departments - Phòng ban
export const table_department = pgTable(
  "hrm_departments",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
    parentId: uuid("parent_id"), // Self-referencing for hierarchy
    level: integer("level").default(1).notNull(),
    managerId: uuid("manager_id"), // Employee ID who manages this department
    locationId: uuid("location_id"), // Reference to location/office
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),
    index("hrm_departments_parent_idx").on(table.parentId),
    index("hrm_departments_manager_idx").on(table.managerId),
    index("hrm_departments_active_idx").on(table.isActive),
  ]
);

export type TblDepartment = typeof table_department.$inferSelect;
export type NewTblDepartment = typeof table_department.$inferInsert;
