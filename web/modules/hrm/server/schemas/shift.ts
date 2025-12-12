import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  time,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Shifts - Ca làm việc
export const table_shift = pgTable(
  "hrm_shifts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
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
    index("hrm_shifts_active_idx").on(table.isActive),
  ]
);

export type TblShift = typeof table_shift.$inferSelect;
export type NewTblShift = typeof table_shift.$inferInsert;

