import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { hrm_tb_departments } from "./hrm.department";
import { mdlHrmSchema } from "./schema";

// Positions - Vị trí công việc
export const hrm_tb_positions = mdlHrmSchema.table(
  "positions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: text("description"), // Text description
    departmentId: uuid("department_id")
      .references(() => hrm_tb_departments.id, { onDelete: "restrict" })
      .notNull(),
    jobFamily: varchar("job_family", { length: 100 }), // Job family/category
    jobGrade: varchar("job_grade", { length: 50 }), // Grade level (e.g., P1, P2, M1, M2)
    reportsTo: uuid("reports_to"), // Position ID this position reports to
    minSalary: integer("min_salary"), // Minimum salary for this position
    maxSalary: integer("max_salary"), // Maximum salary for this position
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    foreignKey({
      columns: [table.reportsTo],
      foreignColumns: [table.id],
    }),
    index("positions_department_idx").on(table.departmentId),
    index("positions_reports_to_idx").on(table.reportsTo),
    index("positions_active_idx").on(table.isActive),
  ],
);

export type HrmTbPosition = typeof hrm_tb_positions.$inferSelect;
export type NewHrmTbPosition = typeof hrm_tb_positions.$inferInsert;
