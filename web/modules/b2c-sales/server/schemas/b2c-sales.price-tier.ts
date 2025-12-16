import { sql } from "drizzle-orm";
import { index, integer, numeric, timestamp, uuid } from "drizzle-orm/pg-core";

import { sale_b2c_tb_price_list_items } from "./b2c-sales.price-list-item";
import { sale_b2c_tb_pricing_rules } from "./b2c-sales.pricing-rule";
import { mdlSaleB2cSchema } from "./schema";

// ============================================
// Price Tier B2C
// ============================================
export const sale_b2c_tb_price_tiers = mdlSaleB2cSchema.table(
  "price_tiers",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    priceListItemId: uuid("price_list_item_id").references(
      () => sale_b2c_tb_price_list_items.id,
      { onDelete: "cascade" },
    ),
    pricingRuleId: uuid("pricing_rule_id").references(
      () => sale_b2c_tb_pricing_rules.id,
      { onDelete: "cascade" },
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
    index("price_tiers_item_idx").on(table.priceListItemId),
    index("price_tiers_rule_idx").on(table.pricingRuleId),
    index("price_tiers_quantity_idx").on(table.minQuantity, table.maxQuantity),
  ],
);

export type SaleB2cTbPriceTier = typeof sale_b2c_tb_price_tiers.$inferSelect;
export type NewSaleB2cTbPriceTier = typeof sale_b2c_tb_price_tiers.$inferInsert;
