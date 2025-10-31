import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { productCategories } from "./product-category";

// Product Masters
export const productMasters = pgTable("product_masters", {
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
  categoryId: uuid("category_id").references(() => productCategories.id),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  createdBy: varchar("created_by", { length: 36 }), // uuid user id
  updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
});

export type ProductMaster = typeof productMasters.$inferSelect;
export type NewProductMaster = typeof productMasters.$inferInsert;

