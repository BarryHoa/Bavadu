import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  numeric,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlProductSchema } from "./schema";
import { table_product_variant } from "./product.variant";

// Product Type: Consumable - Vật tư tiêu hao
export const table_product_type_consumable = mdlProductSchema.table(
  "type_consumable",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
    productVariantId: uuid("product_variant_id")
      .references(() => table_product_variant.id, { onDelete: "cascade" })
      .notNull()
      .unique(),

    // Pricing (default value)
    defaultPurchasePrice: numeric("default_purchase_price", {
      precision: 18,
      scale: 4,
    }),

    // Stock management (default values, can be overridden by stock_settings)
    defaultMinStockLevel: numeric("default_min_stock_level", {
      precision: 14,
      scale: 2,
    }),
    defaultReorderPoint: numeric("default_reorder_point", {
      precision: 14,
      scale: 2,
    }),

    // Expiry & Storage
    expiryTracking: boolean("expiry_tracking").default(false),
    storageConditions: text("storage_conditions"),
    packagingUnit: varchar("packaging_unit", { length: 50 }), // "hộp", "thùng", etc.

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("type_consumable_variant_idx").on(table.productVariantId),
  ]
);

export type TblProductTypeConsumable =
  typeof table_product_type_consumable.$inferSelect;
export type NewTblProductTypeConsumable =
  typeof table_product_type_consumable.$inferInsert;

