import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  numeric,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlProductSchema } from "./schema";
import { product_tb_product_variants } from "./product.variant";

// Product Type: Raw Material - Nguyên vật liệu
export const product_tb_product_type_raw_materials = mdlProductSchema.table(
  "type_raw_material",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
    productVariantId: uuid("product_variant_id")
      .references(() => product_tb_product_variants.id, { onDelete: "cascade" })
      .notNull()
      .unique(),

    // Pricing (default value)
    defaultPurchasePrice: numeric("default_purchase_price", {
      precision: 18,
      scale: 4,
    }),

    // Specifications
    specifications: jsonb("specifications"), // { key: value pairs }
    qualityStandard: text("quality_standard"),

    // Supplier & Lead time
    primarySupplierId: uuid("primary_supplier_id"), // references suppliers table (if exists)
    leadTimeDays: integer("lead_time_days"),

    // Stock management (default values, can be overridden by stock_settings)
    safetyStock: numeric("safety_stock", { precision: 14, scale: 2 }),
    defaultReorderPoint: numeric("default_reorder_point", {
      precision: 14,
      scale: 2,
    }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("type_raw_material_variant_idx").on(table.productVariantId),
    index("type_raw_material_supplier_idx").on(
      table.primarySupplierId
    ),
    // Composite index for supplier and reorder point queries
    index("type_raw_material_supplier_reorder_idx").on(
      table.primarySupplierId,
      table.defaultReorderPoint
    ),
  ]
);

export type ProductTbProductTypeRawMaterial =
  typeof product_tb_product_type_raw_materials.$inferSelect;
export type NewProductTbProductTypeRawMaterial =
  typeof product_tb_product_type_raw_materials.$inferInsert;

