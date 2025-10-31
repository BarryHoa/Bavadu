import { pgTable, varchar, timestamp, boolean, integer, uuid, jsonb } from "drizzle-orm/pg-core";

// Product Categories
export const productCategories = pgTable("product_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: jsonb("name").notNull(), // LocaleDataType<string>
  description: jsonb("description"), // LocaleDataType<string>
  parentId: uuid("parent_id").references((): any => productCategories.id),
  level: integer("level").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  createdBy: varchar("created_by", { length: 36 }), // uuid user id
  updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
});

export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;

