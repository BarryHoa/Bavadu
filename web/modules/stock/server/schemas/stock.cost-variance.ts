import { sql } from "drizzle-orm";
import { index, numeric, timestamp, uuid } from "drizzle-orm/pg-core";
import { mdlStockSchema } from "./schema";
import { product_tb_product_variants } from "../../../product/server/schemas/product.variant";
import { purchase_tb_purchase_orders_line } from "../../../purchase/server/schemas/purchase.order-line";

// Cost Variance - Theo dõi chênh lệch (cho Standard Cost method)
export const stock_tb_cost_variances = mdlStockSchema.table(
  "cost_variances",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => product_tb_product_variants.id, { onDelete: "cascade" }),
    purchaseOrderLineId: uuid("purchase_order_line_id").references(
      () => purchase_tb_purchase_orders_line.id,
      { onDelete: "set null" }
    ),

    standardCost: numeric("standard_cost", {
      precision: 18,
      scale: 4,
    }).notNull(),
    actualCost: numeric("actual_cost", { precision: 18, scale: 4 }).notNull(),
    variance: numeric("variance", { precision: 18, scale: 4 }).notNull(), // actualCost - standardCost
    quantity: numeric("quantity", { precision: 14, scale: 2 }).notNull(),
    totalVariance: numeric("total_variance", {
      precision: 18,
      scale: 4,
    }).notNull(), // variance * quantity

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("cost_variance_variant_idx").on(table.productVariantId),
    index("cost_variance_purchase_line_idx").on(table.purchaseOrderLineId),
    // Composite index for variant and date range queries
    index("cost_variance_variant_created_idx").on(
      table.productVariantId,
      table.createdAt
    ),
  ]
);

export type StockTbCostVariance = typeof stock_tb_cost_variances.$inferSelect;
export type NewStockTbCostVariance = typeof stock_tb_cost_variances.$inferInsert;
