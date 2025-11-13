import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Dynamic Entities allow defining custom fields per model and can be nested via parentId
export const table_dynamic_entity = pgTable(
  "dynamic_entities",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 20 }).notNull(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
    model: varchar("model", { length: 30 }).notNull(), // e.g. "product", "customer", "supplier", etc.
    dataType: varchar("data_type", { length: 20 }).notNull(), // string | number | boolean | date | select | multi-select
    options: jsonb("options"), // [{ label: LocaleDataType<string>, value: any }]
    defaultValue: jsonb("default_value"),
    isRequired: boolean("is_required").default(false).notNull(),
    validation: jsonb("validation"), // array of validation rules
    useIn: jsonb("use_in"), // { report?: boolean; list?: boolean; filter?: boolean }
    isActive: boolean("is_active").default(true).notNull(),
    order: integer("order").default(0).notNull(),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }), // uuid user id
    updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),
    index("dynamic_entities_model_idx").on(table.model),
    index("dynamic_entities_parent_idx").on(table.parentId),
    index("dynamic_entities_active_idx").on(table.isActive),
  ]
);

export type TblDynamicEntity = typeof table_dynamic_entity.$inferSelect;
export type NewTblDynamicEntity = typeof table_dynamic_entity.$inferInsert;
