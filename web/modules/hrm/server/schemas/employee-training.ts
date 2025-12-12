import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_course } from "./course";
import { table_employee } from "./employee";

// Employee Training - Đào tạo nhân viên
export const table_employee_training = pgTable(
  "hrm_employee_trainings",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    courseId: uuid("course_id")
      .references(() => table_course.id, { onDelete: "restrict" })
      .notNull(),
    enrollmentDate: date("enrollment_date").notNull(),
    completionDate: date("completion_date"),
    status: varchar("status", { length: 50 }).notNull().default("enrolled"), // enrolled, in_progress, completed, cancelled
    score: integer("score"), // Final score/grade
    certificateUrl: varchar("certificate_url", { length: 500 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("hrm_employee_trainings_employee_idx").on(table.employeeId),
    index("hrm_employee_trainings_course_idx").on(table.courseId),
    index("hrm_employee_trainings_status_idx").on(table.status),
  ]
);

export type TblEmployeeTraining = typeof table_employee_training.$inferSelect;
export type NewTblEmployeeTraining = typeof table_employee_training.$inferInsert;

