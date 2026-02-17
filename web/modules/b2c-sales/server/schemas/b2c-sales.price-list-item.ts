import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { product_tb_product_masters } from "@mdl/product/server/schemas/product.master";
import { product_tb_product_variants } from "@mdl/product/server/schemas/product.variant";

import { sale_b2c_tb_price_lists } from "./b2c-sales.price-list";
import { mdlSaleB2cSchema } from "./schema";

// ============================================
// Price List Item B2C
// ============================================
export const sale_b2c_tb_price_list_items = mdlSaleB2cSchema.table(
  "price_list_items",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    priceListId: uuid("price_list_id")
      .notNull()
      .references(() => sale_b2c_tb_price_lists.id, { onDelete: "cascade" }),
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => product_tb_product_variants.id, {
        onDelete: "restrict",
      }),
    productMasterId: uuid("product_master_id")
      .notNull()
      .references(() => product_tb_product_masters.id, {
        onDelete: "restrict",
      }),
    pricingType: varchar("pricing_type", { length: 20 })
      .notNull()
      .default("fixed"), // 'fixed' | 'percentage_discount' | 'tiered'
    basePrice: numeric("base_price", { precision: 18, scale: 4 }),
    salePrice: numeric("sale_price", { precision: 18, scale: 4 }),
    discountType: varchar("discount_type", { length: 20 }), // NULL | 'percentage' | 'fixed_amount'
    discountValue: numeric("discount_value", { precision: 18, scale: 4 }),
    finalPrice: numeric("final_price", { precision: 18, scale: 4 }),
    minQuantity: numeric("min_quantity", { precision: 14, scale: 2 })
      .notNull()
      .default("1"),
    maxQuantity: numeric("max_quantity", { precision: 14, scale: 2 }),
    uomId: uuid("uom_id"), // FK -> unit_of_measures
    taxIncluded: boolean("tax_included").notNull().default(false),
    taxRateId: uuid("tax_rate_id"), // FK -> tax_rates
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validTo: timestamp("valid_to", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    priority: integer("priority").notNull().default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("price_list_items_price_list_idx").on(table.priceListId),
    index("price_list_items_product_variant_idx").on(table.productVariantId),
    index("price_list_items_product_master_idx").on(table.productMasterId),
    index("price_list_items_active_idx")
      .on(table.isActive)
      .where(sql`${table.isActive} = true`),
    index("price_list_items_valid_dates_idx").on(
      table.validFrom,
      table.validTo,
    ),
    index("price_list_items_lookup_idx").on(
      table.productVariantId,
      table.priceListId,
      table.isActive,
    ),
  ],
);

export type SaleB2cTbPriceListItem =
  typeof sale_b2c_tb_price_list_items.$inferSelect;
export type NewSaleB2cTbPriceListItem =
  typeof sale_b2c_tb_price_list_items.$inferInsert;
