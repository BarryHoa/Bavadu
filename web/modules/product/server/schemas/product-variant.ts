import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
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
    description: text("description"), // string
    images: jsonb("images"), // string[]
    sku: varchar("sku", { length: 100 }),
    barcode: varchar("barcode", { length: 100 }),
    manufacturer: jsonb("manufacturer"), // { name?: string, code?: string }
    baseUomId: uuid("base_uom_id").references(() => table_unit_of_measure.id),
    saleUomId: uuid("sale_uom_id").references(() => table_unit_of_measure.id),
    purchaseUomId: uuid("purchase_uom_id").references(
      () => table_unit_of_measure.id
    ),
    manufacturingUomId: uuid("manufacturing_uom_id").references(
      () => table_unit_of_measure.id
    ),
    
    // Cost calculation method
    costMethod: varchar("cost_method", { length: 20 })
      .notNull()
      .default("average"), // "average" | "fifo" | "lifo" | "standard"
    
    // Standard cost (only used when costMethod = "standard")
    standardCost: numeric("standard_cost", { precision: 18, scale: 4 }),
    
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
    index("product_variants_sale_uom_idx").on(table.saleUomId),
    index("product_variants_purchase_uom_idx").on(table.purchaseUomId),
    index("product_variants_manufacturing_uom_idx").on(
      table.manufacturingUomId
    ),
    // Composite index for common query: get active variants by master
    index("product_variants_master_active_idx").on(
      table.productMasterId,
      table.isActive
    ),
    // Index for cost method filtering
    index("product_variants_cost_method_idx").on(table.costMethod),
  ]
);

export type TblProductVariant = typeof table_product_variant.$inferSelect;
export type NewTblProductVariant = typeof table_product_variant.$inferInsert;
