import { sql } from "drizzle-orm";
import { index, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";
import { hrm_tb_employees } from "./hrm.employee";
import { hrm_tb_leave_types } from "./hrm.leave-type";

// Leave Balance - Tồn phép
export const hrm_tb_leave_balances = mdlHrmSchema.table(
  "leave_balances",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => hrm_tb_employees.id, { onDelete: "cascade" })
      .notNull(),
    leaveTypeId: uuid("leave_type_id")
      .references(() => hrm_tb_leave_types.id, { onDelete: "restrict" })
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
    index("leave_balances_employee_idx").on(table.employeeId),
    index("leave_balances_type_idx").on(table.leaveTypeId),
    index("leave_balances_year_idx").on(table.year),
    index("leave_balances_employee_type_year_idx").on(
      table.employeeId,
      table.leaveTypeId,
      table.year
    ),
  ]
);

export type HrmTbLeaveBalance = typeof hrm_tb_leave_balances.$inferSelect;
export type NewHrmTbLeaveBalance = typeof hrm_tb_leave_balances.$inferInsert;
