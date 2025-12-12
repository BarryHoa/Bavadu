import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";
import { table_employee } from "./hrm.employee";

// Notifications - Thông báo
export const table_notification = mdlHrmSchema.table(
  "notifications",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    employeeId: uuid("employee_id")
      .references(() => table_employee.id, { onDelete: "cascade" })
      .notNull(),
    type: varchar("type", { length: 50 }).notNull(), // leave_approved, payroll_ready, review_due, etc.
    title: jsonb("title").notNull(), // LocaleDataType<string>
    message: jsonb("message").notNull(), // LocaleDataType<string>
    link: varchar("link", { length: 500 }), // Link to related entity
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    metadata: jsonb("metadata"), // Additional notification data
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("notifications_employee_idx").on(table.employeeId),
    index("notifications_type_idx").on(table.type),
    index("notifications_read_idx").on(table.isRead),
    index("notifications_employee_read_idx").on(table.employeeId, table.isRead),
  ]
);

export type TblNotification = typeof table_notification.$inferSelect;
export type NewTblNotification = typeof table_notification.$inferInsert;

