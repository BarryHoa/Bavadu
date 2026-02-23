import { sql } from "drizzle-orm";
import {
  date,
  foreignKey,
  index,
  integer,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { base_tb_users } from "@base/server/schemas/base.user";

import { hrm_tb_departments } from "./hrm.department";
import { hrm_tb_positions } from "./hrm.position";
import { mdlHrmSchema } from "./schema";

// Employees = HR extension of user. Personal data (name, email, phone, etc.) lives on user.
export const hrm_tb_employees = mdlHrmSchema.table(
  "employees",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    userId: uuid("user_id").references(() => base_tb_users.id, {
      onDelete: "set null",
    }), // 1:1 with user when set (unique)

    code: varchar("code", { length: 100 }).notNull().unique(),
    nationalId: varchar("national_id", { length: 50 }), // CMND/CCCD
    taxId: varchar("tax_id", { length: 50 }),

    positionId: uuid("position_id")
      .references(() => hrm_tb_positions.id, { onDelete: "restrict" })
      .notNull(),
    departmentId: uuid("department_id")
      .references(() => hrm_tb_departments.id, { onDelete: "restrict" })
      .notNull(),
    managerId: uuid("manager_id"),
    status: varchar("status", { length: 50 }).notNull().default("active"),
    type: varchar("type", { length: 50 }),
    hireDate: date("hire_date").notNull(),
    probationEndDate: date("probation_end_date"),
    baseSalary: integer("base_salary"),
    currency: varchar("currency", { length: 10 }).default("VND"),
    locationId: uuid("location_id"),

    bankAccount: varchar("bank_account", { length: 100 }),
    bankName: varchar("bank_name", { length: 255 }),
    bankBranch: varchar("bank_branch", { length: 255 }),
    emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
    emergencyContactPhone: varchar("emergency_contact_phone", { length: 50 }),
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
    uniqueIndex("employees_user_id_unique").on(table.userId),
    index("employees_user_idx").on(table.userId),
    index("employees_code_idx").on(table.code),
    index("employees_position_idx").on(table.positionId),
    index("employees_department_idx").on(table.departmentId),
    index("employees_manager_idx").on(table.managerId),
    index("employees_status_idx").on(table.status),
    index("employees_type_idx").on(table.type),
  ],
);

export type HrmTbEmployee = typeof hrm_tb_employees.$inferSelect;
export type NewHrmTbEmployee = typeof hrm_tb_employees.$inferInsert;
