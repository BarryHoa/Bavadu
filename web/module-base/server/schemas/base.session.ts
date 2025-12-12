import { sql } from "drizzle-orm";
import {
  index,
  timestamp,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { mdBaseSchema } from "./schema";
import { base_tb_users } from "./base.user";

// Sessions
export const base_tb_sessions = mdBaseSchema.table(
  "sessions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`), // UUID v7
    userId: uuid("user_id")
      .notNull()
      .references(() => base_tb_users.id, { onDelete: "cascade" }),
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .unique(),
    ipAddress: varchar("ip_address", { length: 45 }), // IPv6 max length
    userAgent: text("user_agent"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_token_idx").on(table.sessionToken),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ]
);

export type BaseTbSession = typeof base_tb_sessions.$inferSelect;
export type NewBaseTbSession = typeof base_tb_sessions.$inferInsert;

