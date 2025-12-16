import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdlHrmSchema } from "./schema";

// Leave Types - Loại nghỉ phép
export const hrm_tb_leave_types = mdlHrmSchema.table(
  "leave_types",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: text("description"), // Text description
    accrualType: varchar("accrual_type", { length: 50 }).notNull(), // monthly, yearly, none
    accrualRate: integer("accrual_rate"), // Days per period (e.g., 1.25 days/month)
    maxAccrual: integer("max_accrual"), // Maximum days that can be accrued (null = unlimited)
    carryForward: boolean("carry_forward").default(false).notNull(), // Can carry forward to next year
    maxCarryForward: integer("max_carry_forward"), // Max days to carry forward
    requiresApproval: boolean("requires_approval").default(true).notNull(),
    isPaid: boolean("is_paid").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [],
);

export type HrmTbLeaveType = typeof hrm_tb_leave_types.$inferSelect;
export type NewHrmTbLeaveType = typeof hrm_tb_leave_types.$inferInsert;
