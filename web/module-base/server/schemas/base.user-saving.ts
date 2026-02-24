import {
  index,
  jsonb,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { base_tb_users } from "./base.user";
import { mdBaseSchema } from "./schema";

/**
 * User saving - key/value lưu theo user (vd: danh sách cột show/hide của table).
 * Primary key (user_id, key).
 */
export const base_tb_user_saving = mdBaseSchema.table(
  "user_saving",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => base_tb_users.id, { onDelete: "cascade" }),

    key: varchar("key", { length: 255 }).notNull(),

    values: jsonb("values"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.key] }),
    index("user_saving_key_idx").on(table.key),
  ],
);

export type BaseTbUserSaving = typeof base_tb_user_saving.$inferSelect;
export type NewBaseTbUserSaving = typeof base_tb_user_saving.$inferInsert;
