import { base_tb_users } from "@base/server/schemas/base.user";
import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { hrm_tb_departments } from "./hrm.department";
import { hrm_tb_positions } from "./hrm.position";
import { mdlHrmSchema } from "./schema";

// Employees - Nhân viên
export const hrm_tb_employees = mdlHrmSchema.table(
  "employees",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Link to base user (optional - not all employees have user accounts)
    userId: uuid("user_id").references(() => base_tb_users.id, {
      onDelete: "set null",
    }), // Optional: link to user account for authentication

    employeeCode: varchar("employee_code", { length: 100 }).notNull().unique(), // Mã nhân viên
    firstName: varchar("first_name", { length: 255 }),
    lastName: varchar("last_name", { length: 255 }),
    fullName: jsonb("full_name").notNull(), // LocaleDataType<string> - Full name
    email: varchar("email", { length: 255 }).unique(),
    phone: varchar("phone", { length: 50 }),
    dateOfBirth: date("date_of_birth"),
    gender: varchar("gender", { length: 20 }), // male, female, other
    nationalId: varchar("national_id", { length: 50 }), // CMND/CCCD
    taxId: varchar("tax_id", { length: 50 }), // Mã số thuế cá nhân
    address: jsonb("address"), // Address object
    positionId: uuid("position_id")
      .references(() => hrm_tb_positions.id, { onDelete: "restrict" })
      .notNull(),
    departmentId: uuid("department_id")
      .references(() => hrm_tb_departments.id, { onDelete: "restrict" })
      .notNull(),
    managerId: uuid("manager_id"), // Direct manager (employee ID)
    employmentStatus: varchar("employment_status", { length: 50 })
      .notNull()
      .default("active"), // active, inactive, terminated, on_leave
    employmentType: varchar("employment_type", { length: 50 }), // full_time, part_time, contract, intern
    hireDate: date("hire_date").notNull(),
    probationEndDate: date("probation_end_date"), // Ngày kết thúc thử việc
    baseSalary: integer("base_salary"), // Lương cơ bản
    currency: varchar("currency", { length: 10 }).default("VND"),
    locationId: uuid("location_id"), // Office/location
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    foreignKey({
      columns: [table.managerId],
      foreignColumns: [table.id],
    }),
    index("employees_user_idx").on(table.userId),
    index("employees_code_idx").on(table.employeeCode),
    index("employees_email_idx").on(table.email),
    index("employees_position_idx").on(table.positionId),
    index("employees_department_idx").on(table.departmentId),
    index("employees_manager_idx").on(table.managerId),
    index("employees_status_idx").on(table.employmentStatus),
    index("employees_active_idx").on(table.isActive),
  ]
);

export type HrmTbEmployee = typeof hrm_tb_employees.$inferSelect;
export type NewHrmTbEmployee = typeof hrm_tb_employees.$inferInsert;
