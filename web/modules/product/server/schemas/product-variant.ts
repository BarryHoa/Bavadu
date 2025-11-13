import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_product_master } from "./product-master";
import { table_unit_of_measure } from "./unit-of-measure";

// Product Variants
export const table_product_variant = pgTable(
  "product_variants",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
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
  },
  (table) => [
    index("product_variants_master_idx").on(table.productMasterId),
    index("product_variants_sku_idx").on(table.sku),
    index("product_variants_barcode_idx").on(table.barcode),
    index("product_variants_active_idx").on(table.isActive),
    index("product_variants_base_uom_idx").on(table.baseUomId),
  ]
);

export type TblProductVariant = typeof table_product_variant.$inferSelect;
export type NewTblProductVariant = typeof table_product_variant.$inferInsert;
