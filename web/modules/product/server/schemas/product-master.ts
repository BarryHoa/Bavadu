import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_product_category } from "./product-category";

// Product Masters
export const table_product_master = pgTable("product_masters", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  name: jsonb("name").notNull(), // LocaleDataType<string>
  image: text("image"),
  description: jsonb("description"), // LocaleDataType<string>
  type: varchar("type", {
    length: 20,
  }).notNull(), // ProductMasterType: goods, service, finished_good, raw_material, consumable, asset, tool
  features: jsonb("features"), // Partial<ProductMasterFeatures>
  isActive: boolean("is_active").default(true).notNull(),
  brand: jsonb("brand"), // LocaleDataType<string>
  categoryId: uuid("category_id").references(() => table_product_category.id),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  createdBy: varchar("created_by", { length: 36 }), // uuid user id
  updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
});

export type TblProductMaster = typeof table_product_master.$inferSelect;
export type NewTblProductMaster = typeof table_product_master.$inferInsert;

