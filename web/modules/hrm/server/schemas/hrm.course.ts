import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";

// Courses - Khóa học
export const hrm_tb_courses = mdlHrmSchema.table(
  "courses",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: text("description"), // Text description
    category: varchar("category", { length: 100 }), // technical, soft_skills, compliance, etc.
    duration: integer("duration"), // Hours
    format: varchar("format", { length: 50 }), // online, classroom, hybrid
    instructor: varchar("instructor", { length: 255 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("courses_code_idx").on(table.code),
    index("courses_category_idx").on(table.category),
    index("courses_active_idx").on(table.isActive),
  ]
);

export type HrmTbCourse = typeof hrm_tb_courses.$inferSelect;
export type NewHrmTbCourse = typeof hrm_tb_courses.$inferInsert;

