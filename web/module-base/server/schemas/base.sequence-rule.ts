import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdBaseSchema } from "./schema";

export const base_tb_sequence_rules = mdBaseSchema.table(
  "sequence_rules",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    name: varchar("name", { length: 100 }).notNull().unique(),
    prefix: varchar("prefix", { length: 50 }).default(""),
    format: varchar("format", { length: 20 }).default("%06d"),
    start: integer("start").default(1).notNull(),
    step: integer("step").default(1).notNull(),
    currentValue: bigint("current_value", { mode: "number" }).default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("sequence_rules_name_idx").on(table.name),
    index("sequence_rules_active_idx").on(table.isActive),
    index("sequence_rules_created_at_idx").on(table.createdAt),
  ],
);

export type BaseTbSequenceRule = typeof base_tb_sequence_rules.$inferSelect;
export type NewBaseTbSequenceRule = typeof base_tb_sequence_rules.$inferInsert;
