import { sql } from "drizzle-orm";
import {
  date,
  index,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";
import { hrm_tb_employees } from "./hrm.employee";
import { hrm_tb_shifts } from "./hrm.shift";

// Roster - Lịch phân ca
export const hrm_tb_rosters = mdlHrmSchema.table(
  "rosters",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => hrm_tb_employees.id, { onDelete: "cascade" })
      .notNull(),
    shiftId: uuid("shift_id")
      .references(() => hrm_tb_shifts.id, { onDelete: "restrict" })
      .notNull(),
    workDate: date("work_date").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("scheduled"), // scheduled, confirmed, cancelled
    notes: varchar("notes", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("rosters_employee_idx").on(table.employeeId),
    index("rosters_shift_idx").on(table.shiftId),
    index("rosters_date_idx").on(table.workDate),
    index("rosters_employee_date_idx").on(table.employeeId, table.workDate),
  ]
);

export type HrmTbRoster = typeof hrm_tb_rosters.$inferSelect;
export type NewHrmTbRoster = typeof hrm_tb_rosters.$inferInsert;
