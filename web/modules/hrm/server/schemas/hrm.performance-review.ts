import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";
import { table_employee } from "./hrm.employee";

// Performance Reviews - Đánh giá hiệu suất
export const table_performance_review = mdlHrmSchema.table(
  "performance_reviews",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    reviewType: varchar("review_type", { length: 50 }).notNull(), // annual, quarterly, monthly, 1on1, 360
    reviewPeriod: varchar("review_period", { length: 50 }), // e.g., "2024-Q1"
    reviewDate: date("review_date").notNull(),
    reviewerId: uuid("reviewer_id")
      .references(() => table_employee.id, { onDelete: "set null" })
      .notNull(), // Manager/HR who conducts review
    overallRating: integer("overall_rating"), // 1-5 rating
    strengths: text("strengths"),
    areasForImprovement: text("areas_for_improvement"),
    goals: jsonb("goals"), // Related goals
    feedback: text("feedback"),
    employeeComments: text("employee_comments"),
    status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, in_progress, completed
    completedDate: date("completed_date"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("performance_reviews_employee_idx").on(table.employeeId),
    index("performance_reviews_reviewer_idx").on(table.reviewerId),
    index("performance_reviews_type_idx").on(table.reviewType),
    index("performance_reviews_status_idx").on(table.status),
  ]
);

export type TblPerformanceReview = typeof table_performance_review.$inferSelect;
export type NewTblPerformanceReview = typeof table_performance_review.$inferInsert;

