import { sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_product_variant } from "./product-variant";

// Product Packing
export const table_product_packing = pgTable("product_packings", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
  productVariantId: uuid("product_variant_id")
    .references(() => table_product_variant.id)
    .notNull(),
  name: jsonb("name").notNull(), // LocaleDataType<string>
  description: jsonb("description"), // LocaleDataType<string>
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  createdBy: varchar("created_by", { length: 36 }), // uuid user id
  updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
});

export type TblProductPacking = typeof table_product_packing.$inferSelect;
export type NewTblProductPacking = typeof table_product_packing.$inferInsert;

