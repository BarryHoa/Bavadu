import { table_product_master } from "@mdl/product/server/schemas/product-master";
import { table_product_variant } from "@mdl/product/server/schemas/product-variant";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ============================================
// Price Lists B2C
// ============================================
// Cấu trúc applicableTo:
// {
//   channels?: string[],      // ['online', 'offline', 'mobile_app']
//   stores?: string[],         // Store IDs
//   locations?: string[],      // Location IDs (HCM, HN, etc.)
//   regions?: string[],        // Region codes
//   customerGroups?: string[]  // Customer group IDs
// }
export const table_price_lists_b2c = pgTable(
  "price_lists_b2c",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 64 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: text("description"),
    type: varchar("type", { length: 20 }).notNull().default("standard"), // 'standard' | 'promotion' | 'seasonal' | 'flash_sale'
    status: varchar("status", { length: 20 }).notNull().default("active"), // 'draft' | 'active' | 'inactive' | 'expired'
    priority: integer("priority").notNull().default(0),
    currencyId: uuid("currency_id"), // FK -> currencies (mặc định VND)
    validFrom: timestamp("valid_from", { withTimezone: true }).notNull(), // Bắt buộc
    validTo: timestamp("valid_to", { withTimezone: true }), // NULL = mãi mãi (chỉ cho standard type)
    isDefault: boolean("is_default").notNull().default(false),
    applicableTo: jsonb("applicable_to").notNull(), // JSONB cho điều kiện áp dụng - Bắt buộc
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("idx_price_lists_b2c_code").on(table.code),
    index("idx_price_lists_b2c_status").on(table.status),
    index("idx_price_lists_b2c_type").on(table.type),
    index("idx_price_lists_b2c_valid_dates").on(table.validFrom, table.validTo),
    index("idx_price_lists_b2c_default")
      .on(table.isDefault)
      .where(sql`${table.isDefault} = true`),
    index("idx_price_lists_b2c_applicable_to").on(table.applicableTo),
    index("idx_price_lists_b2c_type_status").on(table.type, table.status),
    // Check constraint: validTo phải >= validFrom (nếu có)
    check(
      "price_lists_b2c_valid_dates_check",
      sql`(${table.validTo} IS NULL) OR (${table.validTo} >= ${table.validFrom})`
    ),
    // Check constraint: Nếu type != 'standard' thì validTo không được NULL
    check(
      "price_lists_b2c_valid_to_required_check",
      sql`(${table.type} = 'standard') OR (${table.validTo} IS NOT NULL)`
    ),
  ]
);

export type TblPriceListB2C = typeof table_price_lists_b2c.$inferSelect;
export type NewTblPriceListB2C = typeof table_price_lists_b2c.$inferInsert;

// ============================================
// Price List Items B2C
// ============================================
export const table_price_list_items_b2c = pgTable(
  "price_list_items_b2c",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    priceListId: uuid("price_list_id")
      .notNull()
      .references(() => table_price_lists_b2c.id, { onDelete: "cascade" }),
    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => table_product_variant.id, { onDelete: "restrict" }),
    productMasterId: uuid("product_master_id")
      .notNull()
      .references(() => table_product_master.id, { onDelete: "restrict" }),
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
    index("idx_price_list_items_b2c_price_list").on(table.priceListId),
    index("idx_price_list_items_b2c_product_variant").on(
      table.productVariantId
    ),
    index("idx_price_list_items_b2c_product_master").on(table.productMasterId),
    index("idx_price_list_items_b2c_active")
      .on(table.isActive)
      .where(sql`${table.isActive} = true`),
    index("idx_price_list_items_b2c_valid_dates").on(
      table.validFrom,
      table.validTo
    ),
    index("idx_price_list_items_b2c_lookup").on(
      table.productVariantId,
      table.priceListId,
      table.isActive
    ),
  ]
);

export type TblPriceListItemB2C =
  typeof table_price_list_items_b2c.$inferSelect;
export type NewTblPriceListItemB2C =
  typeof table_price_list_items_b2c.$inferInsert;

// ============================================
// Pricing Rules B2C
// ============================================
// Cấu trúc conditions:
// {
//   productMasterIds?: string[],
//   productVariantIds?: string[],
//   categoryIds?: string[],
//   brandIds?: string[],
//   customerGroupIds?: string[],
//   channels?: string[],
//   regions?: string[]
// }
export const table_pricing_rules_b2c = pgTable(
  "pricing_rules_b2c",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    priceListId: uuid("price_list_id")
      .notNull()
      .references(() => table_price_lists_b2c.id, { onDelete: "cascade" }),
    conditions: jsonb("conditions").notNull(),
    pricingMethod: varchar("pricing_method", { length: 20 }).notNull(), // 'fixed' | 'percentage' | 'formula' | 'tiered'
    fixedPrice: numeric("fixed_price", { precision: 18, scale: 4 }),
    discountType: varchar("discount_type", { length: 20 }), // 'percentage' | 'fixed_amount'
    discountValue: numeric("discount_value", { precision: 18, scale: 4 }),
    formula: text("formula"),
    minQuantity: numeric("min_quantity", { precision: 14, scale: 2 })
      .notNull()
      .default("1"),
    maxQuantity: numeric("max_quantity", { precision: 14, scale: 2 }),
    priority: integer("priority").notNull().default(0),
    validFrom: timestamp("valid_from", { withTimezone: true }),
    validTo: timestamp("valid_to", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    // Áp dụng cho sản phẩm ngoại lệ (explicit pricing items)
    // false: Rule chỉ áp dụng cho sản phẩm KHÔNG có explicit pricing
    // true: Rule áp dụng cho TẤT CẢ sản phẩm (kể cả có explicit pricing)
    applyToExceptions: boolean("apply_to_exceptions").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_pricing_rules_b2c_price_list").on(table.priceListId),
    index("idx_pricing_rules_b2c_active")
      .on(table.isActive)
      .where(sql`${table.isActive} = true`),
    index("idx_pricing_rules_b2c_priority").on(
      table.priceListId,
      table.priority
    ),
  ]
);

export type TblPricingRuleB2C = typeof table_pricing_rules_b2c.$inferSelect;
export type NewTblPricingRuleB2C = typeof table_pricing_rules_b2c.$inferInsert;

// ============================================
// Price Tiers B2C
// ============================================
export const table_price_tiers_b2c = pgTable(
  "price_tiers_b2c",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    priceListItemId: uuid("price_list_item_id").references(
      () => table_price_list_items_b2c.id,
      { onDelete: "cascade" }
    ),
    pricingRuleId: uuid("pricing_rule_id").references(
      () => table_pricing_rules_b2c.id,
      { onDelete: "cascade" }
    ),
    minQuantity: numeric("min_quantity", { precision: 14, scale: 2 }).notNull(),
    maxQuantity: numeric("max_quantity", { precision: 14, scale: 2 }),
    price: numeric("price", { precision: 18, scale: 4 }).notNull(),
    discountPercentage: numeric("discount_percentage", {
      precision: 5,
      scale: 2,
    }),
    priority: integer("priority").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_price_tiers_b2c_item").on(table.priceListItemId),
    index("idx_price_tiers_b2c_rule").on(table.pricingRuleId),
    index("idx_price_tiers_b2c_quantity").on(
      table.minQuantity,
      table.maxQuantity
    ),
  ]
);

export type TblPriceTierB2C = typeof table_price_tiers_b2c.$inferSelect;
export type NewTblPriceTierB2C = typeof table_price_tiers_b2c.$inferInsert;
