import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { productMasters } from "./product-master";
import { unitsOfMeasure } from "./unit-of-measure";

// Product Variants
export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productMasterId: uuid("product_master_id")
    .references(() => productMasters.id)
    .notNull(),
  name: jsonb("name").notNull(), // LocaleDataType<string>
  description: jsonb("description"), // LocaleDataType<string>
  images: jsonb("images"), // string[]
  sku: varchar("sku", { length: 100 }),
  barcode: varchar("barcode", { length: 100 }),
  manufacturer: jsonb("manufacturer"), // { name?: LocaleDataType<string>, code?: string }
  baseUomId: uuid("base_uom_id").references(() => unitsOfMeasure.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  createdBy: varchar("created_by", { length: 36 }), // uuid user id
  updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

