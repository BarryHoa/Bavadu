import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_employee } from "./employee";
import { table_hrm_role } from "./role";

// Employee Role Assignments - Phân quyền cho nhân viên
export const table_employee_role = pgTable(
  "hrm_employee_roles",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    roleId: uuid("role_id")
      .references(() => table_hrm_role.id, { onDelete: "restrict" })
      .notNull(),
    departmentId: uuid("department_id"), // Scope: chỉ áp dụng cho phòng ban này (null = toàn công ty)
    locationId: uuid("location_id"), // Scope: chỉ áp dụng cho địa điểm này (null = tất cả)
    effectiveDate: timestamp("effective_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }), // null = không hết hạn
    createdAt: timestamp("created_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    index("hrm_employee_roles_employee_idx").on(table.employeeId),
    index("hrm_employee_roles_role_idx").on(table.roleId),
    index("hrm_employee_roles_department_idx").on(table.departmentId),
    index("hrm_employee_roles_location_idx").on(table.locationId),
  ]
);

export type TblEmployeeRole = typeof table_employee_role.$inferSelect;
export type NewTblEmployeeRole = typeof table_employee_role.$inferInsert;

