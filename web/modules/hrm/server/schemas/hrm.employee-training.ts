import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";
import { hrm_tb_courses } from "./hrm.course";
import { hrm_tb_employees } from "./hrm.employee";

// Employee Training - Đào tạo nhân viên
export const hrm_tb_employees_training = mdlHrmSchema.table(
  "employee_trainings",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => hrm_tb_employees.id, { onDelete: "cascade" })
      .notNull(),
    courseId: uuid("course_id")
      .references(() => hrm_tb_courses.id, { onDelete: "restrict" })
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
    index("employee_trainings_employee_idx").on(table.employeeId),
    index("employee_trainings_course_idx").on(table.courseId),
    index("employee_trainings_status_idx").on(table.status),
  ]
);

export type HrmTbEmployeeTraining = typeof hrm_tb_employees_training.$inferSelect;
export type NewHrmTbEmployeeTraining = typeof hrm_tb_employees_training.$inferInsert;

