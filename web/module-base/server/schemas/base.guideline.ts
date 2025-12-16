import { sql } from "drizzle-orm";
import { index, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { mdBaseSchema } from "./schema";

// Guidelines table
export const base_tb_guidelines = mdBaseSchema.table(
  "guidelines",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`), // UUID v7
    key: varchar("key", { length: 255 }).notNull().unique(),
    content: text("content").notNull(), // Markdown content
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("guidelines_key_idx").on(table.key)],
);

export type BaseTbGuideline = typeof base_tb_guidelines.$inferSelect;
export type NewBaseTbGuideline = typeof base_tb_guidelines.$inferInsert;
