import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdBaseSchema } from "./schema";
import { base_tb_users } from "./base.user";

// Notifications - Thông báo (base, dùng chung cho toàn hệ thống)
export const base_tb_notifications = mdBaseSchema.table(
  "notifications",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    userId: uuid("user_id")
      .references(() => base_tb_users.id, { onDelete: "cascade" })
      .notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    title: jsonb("title").notNull(),
    message: jsonb("message").notNull(),
    link: varchar("link", { length: 500 }),
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("notifications_user_idx").on(table.userId),
    index("notifications_type_idx").on(table.type),
    index("notifications_read_idx").on(table.isRead),
    index("notifications_user_read_idx").on(table.userId, table.isRead),
  ],
);

export type BaseTbNotification = typeof base_tb_notifications.$inferSelect;
export type NewBaseTbNotification = typeof base_tb_notifications.$inferInsert;
