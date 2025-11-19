import { sql } from "drizzle-orm";
import { index, numeric, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { table_product_variant } from "../../../product/server/schemas/product-variant";
import { table_purchase_order_line } from "../../../purchase/server/schemas/order-line";

// Cost Variance - Theo dõi chênh lệch (cho Standard Cost method)
export const table_cost_variance = pgTable(
  "cost_variances",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    productVariantId: uuid("product_variant_id")
      .notNull()
      .references(() => table_product_variant.id, { onDelete: "cascade" }),
    purchaseOrderLineId: uuid("purchase_order_line_id").references(
      () => table_purchase_order_line.id,
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

export type TblCostVariance = typeof table_cost_variance.$inferSelect;
export type NewTblCostVariance = typeof table_cost_variance.$inferInsert;
