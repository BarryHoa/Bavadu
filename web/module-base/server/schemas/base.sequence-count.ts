import { sql } from "drizzle-orm";
import { index, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { mdBaseSchema } from "./schema";
import { base_tb_sequence_rules } from "./base.sequence-rule";

export const base_tb_sequence_counts = mdBaseSchema.table(
  "sequence_counts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    ruleId: uuid("rule_id")
      .notNull()
      .references(() => base_tb_sequence_rules.id, { onDelete: "cascade" }),
    value: varchar("value", { length: 100 }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("sequence_counts_rule_id_idx").on(table.ruleId),
    index("sequence_counts_created_at_idx").on(table.createdAt),
  ],
);

export type BaseTbSequenceCount = typeof base_tb_sequence_counts.$inferSelect;
export type NewBaseTbSequenceCount = typeof base_tb_sequence_counts.$inferInsert;
