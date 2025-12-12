import { sql } from "drizzle-orm";
import { index, integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { table_employee } from "./employee";
import { table_leave_type } from "./leave-type";

// Leave Balance - Tồn phép
export const table_leave_balance = pgTable(
  "hrm_leave_balances",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    leaveTypeId: uuid("leave_type_id")
      .references(() => table_leave_type.id, { onDelete: "restrict" })
      .notNull(),
    year: integer("year").notNull(),
    accrued: integer("accrued").default(0).notNull(), // Days accrued this year
    used: integer("used").default(0).notNull(), // Days used this year
    balance: integer("balance").default(0).notNull(), // Current balance (accrued - used)
    carriedForward: integer("carried_forward").default(0).notNull(), // Days carried from previous year
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("hrm_leave_balances_employee_idx").on(table.employeeId),
    index("hrm_leave_balances_type_idx").on(table.leaveTypeId),
    index("hrm_leave_balances_year_idx").on(table.year),
    index("hrm_leave_balances_employee_type_year_idx").on(
      table.employeeId,
      table.leaveTypeId,
      table.year
    ),
  ]
);

export type TblLeaveBalance = typeof table_leave_balance.$inferSelect;
export type NewTblLeaveBalance = typeof table_leave_balance.$inferInsert;
