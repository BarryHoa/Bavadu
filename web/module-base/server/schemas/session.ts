import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { table_user } from "./user";

// Sessions
export const table_session = pgTable(
  "sessions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`), // UUID v7
    userId: uuid("user_id")
      .notNull()
      .references(() => table_user.id, { onDelete: "cascade" }),
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

export type TblSession = typeof table_session.$inferSelect;
export type NewTblSession = typeof table_session.$inferInsert;

