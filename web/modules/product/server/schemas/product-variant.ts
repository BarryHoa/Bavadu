import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_product_master } from "./product-master";
import { table_unit_of_measure } from "./unit-of-measure";

// Product Variants
export const table_product_variant = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productMasterId: uuid("product_master_id")
    .references(() => table_product_master.id)
    .notNull(),
  name: jsonb("name").notNull(), // LocaleDataType<string>
  description: jsonb("description"), // LocaleDataType<string>
  images: jsonb("images"), // string[]
  sku: varchar("sku", { length: 100 }),
  barcode: varchar("barcode", { length: 100 }),
  manufacturer: jsonb("manufacturer"), // { name?: LocaleDataType<string>, code?: string }
  baseUomId: uuid("base_uom_id").references(() => table_unit_of_measure.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  createdBy: varchar("created_by", { length: 36 }), // uuid user id
  updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
});

export type TblProductVariant = typeof table_product_variant.$inferSelect;
export type NewTblProductVariant = typeof table_product_variant.$inferInsert;
