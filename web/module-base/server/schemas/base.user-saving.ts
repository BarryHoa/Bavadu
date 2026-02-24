import {
  index,
  jsonb,
  primaryKey,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { base_tb_users } from "./base.user";
import { mdBaseSchema } from "./schema";

export const base_tb_user_saving = mdBaseSchema.table(
  "user_saving",
  {
    id: uuid("id").defaultRandom().notNull(),

    userId: uuid("user_id")
      .notNull()
      .references(() => base_tb_users.id, { onDelete: "cascade" }),

    key: varchar("key", { length: 255 }).notNull(),

    group: varchar("group", { length: 64 }).default("default").notNull(),

    values: jsonb("values"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Primary key: id (uuid)
    primaryKey({ columns: [table.id] }),
    // Không cho phép trùng (user_id, key, group)
    uniqueIndex("user_saving_user_key_group_uniq").on(
      table.userId,
      table.key,
      table.group,
    ),
    index("user_saving_key_idx").on(table.key),
    index("user_saving_group_idx").on(table.group),
    index("user_saving_user_id_idx").on(table.userId),
  ],
);

export type BaseTbUserSaving = typeof base_tb_user_saving.$inferSelect;
export type NewBaseTbUserSaving = typeof base_tb_user_saving.$inferInsert;
