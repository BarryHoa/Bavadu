import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Product Categories
export const table_product_category = pgTable(
  "product_categories",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
    parentId: uuid("parent_id"),
    level: integer("level").default(1).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
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
  ]
);

export type TblProductCategory = typeof table_product_category.$inferSelect;
export type NewTblProductCategory = typeof table_product_category.$inferInsert;
