import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";

// Departments - Phòng ban
export const hrm_tb_departments = mdlHrmSchema.table(
  "departments",
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
    index("departments_parent_idx").on(table.parentId),
    index("departments_manager_idx").on(table.managerId),
    index("departments_active_idx").on(table.isActive),
  ]
);

export type HrmTbDepartment = typeof hrm_tb_departments.$inferSelect;
export type NewHrmTbDepartment = typeof hrm_tb_departments.$inferInsert;
