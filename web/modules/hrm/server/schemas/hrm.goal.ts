import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdlHrmSchema } from "./schema";
import { hrm_tb_employees } from "./hrm.employee";

// Goals - Mục tiêu (KPI/OKR)
export const hrm_tb_goals = mdlHrmSchema.table(
  "goals",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => hrm_tb_employees.id, { onDelete: "cascade" })
      .notNull(),
    goalType: varchar("goal_type", { length: 50 }).notNull(), // kpi, okr
    title: jsonb("title").notNull(), // LocaleDataType<string>
    description: text("description"), // Text description
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
    index("goals_employee_idx").on(table.employeeId),
    index("goals_type_idx").on(table.goalType),
    index("goals_status_idx").on(table.status),
    index("goals_dates_idx").on(table.startDate, table.endDate),
  ],
);

export type HrmTbGoal = typeof hrm_tb_goals.$inferSelect;
export type NewHrmTbGoal = typeof hrm_tb_goals.$inferInsert;
