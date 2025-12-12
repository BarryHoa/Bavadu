import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_employee } from "./employee";

// Goals - Mục tiêu (KPI/OKR)
export const table_goal = pgTable(
  "hrm_goals",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    goalType: varchar("goal_type", { length: 50 }).notNull(), // kpi, okr
    title: jsonb("title").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
    targetValue: integer("target_value"),
    currentValue: integer("current_value").default(0),
    unit: varchar("unit", { length: 50 }), // percentage, number, currency, etc.
    period: varchar("period", { length: 50 }).notNull(), // quarterly, yearly, etc.
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("active"), // active, completed, cancelled
    progress: integer("progress").default(0), // 0-100 percentage
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("hrm_goals_employee_idx").on(table.employeeId),
    index("hrm_goals_type_idx").on(table.goalType),
    index("hrm_goals_status_idx").on(table.status),
    index("hrm_goals_dates_idx").on(table.startDate, table.endDate),
  ]
);

export type TblGoal = typeof table_goal.$inferSelect;
export type NewTblGoal = typeof table_goal.$inferInsert;

