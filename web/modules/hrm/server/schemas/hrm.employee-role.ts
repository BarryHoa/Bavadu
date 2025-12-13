import { sql } from "drizzle-orm";
import {
  index,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";
import { hrm_tb_employees } from "./hrm.employee";
import { base_tb_roles } from "@base/server/schemas/base.role";

// Employee Role Assignments - Phân quyền cho nhân viên
export const hrm_tb_employees_role = mdlHrmSchema.table(
  "employee_roles",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => hrm_tb_employees.id, { onDelete: "cascade" })
      .notNull(),
    roleId: uuid("role_id")
      .references(() => base_tb_roles.id, { onDelete: "restrict" })
      .notNull(),
    departmentId: uuid("department_id"), // Scope: chỉ áp dụng cho phòng ban này (null = toàn công ty)
    locationId: uuid("location_id"), // Scope: chỉ áp dụng cho địa điểm này (null = tất cả)
    effectiveDate: timestamp("effective_date", { withTimezone: true }),
    expiryDate: timestamp("expiry_date", { withTimezone: true }), // null = không hết hạn
    createdAt: timestamp("created_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    index("employee_roles_employee_idx").on(table.employeeId),
    index("employee_roles_role_idx").on(table.roleId),
    index("employee_roles_department_idx").on(table.departmentId),
    index("employee_roles_location_idx").on(table.locationId),
  ]
);

export type HrmTbEmployeeRole = typeof hrm_tb_employees_role.$inferSelect;
export type NewHrmTbEmployeeRole = typeof hrm_tb_employees_role.$inferInsert;

