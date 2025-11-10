import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_product_variant } from "./product-variant";

// Product Attributes (junction table)
export const table_product_attribute = pgTable("product_attributes", {
  id: uuid("id").primaryKey().defaultRandom(),
  productVariantId: uuid("product_variant_id")
    .references(() => table_product_variant.id)
    .notNull(),
  code: varchar("code", { length: 100 }).notNull(),
  name: jsonb("name").notNull(), // LocaleDataType<string>
  value: text("value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  createdBy: varchar("created_by", { length: 36 }), // uuid user id
  updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
});

export type TblProductAttribute = typeof table_product_attribute.$inferSelect;
export type NewTblProductAttribute = typeof table_product_attribute.$inferInsert;

