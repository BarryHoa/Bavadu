import { sql } from "drizzle-orm";
import {
  date,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_employee } from "./employee";
import { table_shift } from "./shift";

// Roster - Lịch phân ca
export const table_roster = pgTable(
  "hrm_rosters",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    shiftId: uuid("shift_id")
      .references(() => table_shift.id, { onDelete: "restrict" })
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
    index("hrm_rosters_employee_idx").on(table.employeeId),
    index("hrm_rosters_shift_idx").on(table.shiftId),
    index("hrm_rosters_date_idx").on(table.workDate),
    index("hrm_rosters_employee_date_idx").on(table.employeeId, table.workDate),
  ]
);

export type TblRoster = typeof table_roster.$inferSelect;
export type NewTblRoster = typeof table_roster.$inferInsert;
