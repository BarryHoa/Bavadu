import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";

// Shifts - Ca làm việc
export const hrm_tb_shifts = mdlHrmSchema.table(
  "shifts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: text("description"), // Text description
    startTime: time("start_time").notNull(), // HH:mm format
    endTime: time("end_time").notNull(), // HH:mm format
    breakDuration: integer("break_duration").default(0), // Minutes
    workingHours: integer("working_hours").notNull(), // Total working hours per day
    isNightShift: boolean("is_night_shift").default(false).notNull(), // Night shift for OT calculation
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("shifts_active_idx").on(table.isActive),
  ]
);

export type HrmTbShift = typeof hrm_tb_shifts.$inferSelect;
export type NewHrmTbShift = typeof hrm_tb_shifts.$inferInsert;

