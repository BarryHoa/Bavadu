import {
  boolean,
  integer,
  time,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { mdlHrmSchema } from "./schema";

const DEFAULT_ID = "default";

// Timesheet settings (single-row config: default check in/out, break, rounding, etc.)
export const hrm_tb_timesheet_settings = mdlHrmSchema.table(
  "timesheet_settings",
  {
    id: varchar("id", { length: 50 }).primaryKey().default(DEFAULT_ID),
    defaultCheckInTime: time("default_check_in_time"), // e.g. 09:00
    defaultCheckOutTime: time("default_check_out_time"), // e.g. 18:00
    breakMinutes: integer("break_minutes").default(60).notNull(),
    maxHoursPerDay: integer("max_hours_per_day"), // nullable = no cap
    allowWeekend: boolean("allow_weekend").default(false).notNull(),
    weekStart: integer("week_start").default(1).notNull(), // 0=Sunday, 1=Monday
    roundMinutes: integer("round_minutes").default(15).notNull(),
    roundDirection: varchar("round_direction", { length: 20 })
      .default("nearest")
      .notNull(), // down | up | nearest
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
);

export type HrmTbTimesheetSettings =
  typeof hrm_tb_timesheet_settings.$inferSelect;
export type NewHrmTbTimesheetSettings =
  typeof hrm_tb_timesheet_settings.$inferInsert;
