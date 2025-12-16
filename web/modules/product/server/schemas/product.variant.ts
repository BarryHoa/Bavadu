import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  numeric,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdlProductSchema } from "./schema";
import { product_tb_product_masters } from "./product.master";
import { product_tb_units_of_measure } from "./product.uom";

// Product Variants
export const product_tb_product_variants = mdlProductSchema.table(
  "variants",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    productMasterId: uuid("product_master_id")
      .references(() => product_tb_product_masters.id)
      .notNull(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: text("description"), // string
    images: jsonb("images"), // string[]
    sku: varchar("sku", { length: 100 }),
    barcode: varchar("barcode", { length: 100 }),
    manufacturer: jsonb("manufacturer"), // { name?: string, code?: string }
    baseUomId: uuid("base_uom_id").references(
      () => product_tb_units_of_measure.id,
    ),
    saleUomId: uuid("sale_uom_id").references(
      () => product_tb_units_of_measure.id,
    ),
    purchaseUomId: uuid("purchase_uom_id").references(
      () => product_tb_units_of_measure.id,
    ),
    manufacturingUomId: uuid("manufacturing_uom_id").references(
      () => product_tb_units_of_measure.id,
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
    index("variants_master_idx").on(table.productMasterId),
    index("variants_sku_idx").on(table.sku),
    index("variants_barcode_idx").on(table.barcode),
    index("variants_active_idx").on(table.isActive),
    index("variants_base_uom_idx").on(table.baseUomId),
    index("variants_sale_uom_idx").on(table.saleUomId),
    index("variants_purchase_uom_idx").on(table.purchaseUomId),
    index("variants_manufacturing_uom_idx").on(table.manufacturingUomId),
    // Composite index for common query: get active variants by master
    index("variants_master_active_idx").on(
      table.productMasterId,
      table.isActive,
    ),
    // Index for cost method filtering
    index("variants_cost_method_idx").on(table.costMethod),
  ],
);

export type ProductTbProductVariant =
  typeof product_tb_product_variants.$inferSelect;
export type NewProductTbProductVariant =
  typeof product_tb_product_variants.$inferInsert;
