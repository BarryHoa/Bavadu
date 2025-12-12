import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sale_b2c_tb_price_lists } from "./b2c-sales.price-list";
import { mdlSaleB2cSchema } from "./schema";

// ============================================
// Pricing Rule B2C
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
export const sale_b2c_tb_pricing_rules = mdlSaleB2cSchema.table(
  "pricing_rules",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    priceListId: uuid("price_list_id")
      .notNull()
      .references(() => sale_b2c_tb_price_lists.id, { onDelete: "cascade" }),
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
    index("pricing_rules_price_list_idx").on(table.priceListId),
    index("pricing_rules_active_idx")
      .on(table.isActive)
      .where(sql`${table.isActive} = true`),
    index("pricing_rules_priority_idx").on(
      table.priceListId,
      table.priority
    ),
  ]
);

export type SaleB2cTbPricingRule = typeof sale_b2c_tb_pricing_rules.$inferSelect;
export type NewSaleB2cTbPricingRule = typeof sale_b2c_tb_pricing_rules.$inferInsert;

