import { sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// Guidelines table
export const table_guideline = pgTable(
  "guidelines",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`), // UUID v7
    key: varchar("key", { length: 255 })
      .notNull()
      .unique(),
    content: text("content").notNull(), // Markdown content
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("guidelines_key_idx").on(table.key),
  ]
);

export type TblGuideline = typeof table_guideline.$inferSelect;
export type NewTblGuideline = typeof table_guideline.$inferInsert;

