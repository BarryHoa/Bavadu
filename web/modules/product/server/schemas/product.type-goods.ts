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
import { product_tb_product_variants } from "./product.variant";

// Product Type: Goods - Hàng hóa mua bán
export const product_tb_product_type_goods = mdlProductSchema.table(
  "type_goods",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    productVariantId: uuid("product_variant_id")
      .references(() => product_tb_product_variants.id, { onDelete: "cascade" })
      .notNull()
      .unique(), // 1 variant = 1 goods record

    // Pricing (default values, actual prices in transactions)
    defaultSalePrice: numeric("default_sale_price", {
      precision: 18,
      scale: 4,
    }), // Giá bán mặc định (chỉ để tham khảo)
    defaultPurchasePrice: numeric("default_purchase_price", {
      precision: 18,
      scale: 4,
    }), // Giá mua mặc định (chỉ để tham khảo)

    // Physical attributes
    weight: numeric("weight", { precision: 10, scale: 2 }), // kg
    dimensions: jsonb("dimensions"), // { length, width, height, unit }
    color: varchar("color", { length: 50 }),
    style: varchar("style", { length: 100 }),

    // Expiry & Storage
    expiryDate: timestamp("expiry_date", { withTimezone: true }),
    expiryTracking: boolean("expiry_tracking").default(false),
    storageConditions: text("storage_conditions"), // "Nhiệt độ phòng", "Tủ lạnh", etc.

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("type_goods_variant_idx").on(table.productVariantId),
    index("type_goods_expiry_idx").on(table.expiryDate),
  ],
);

export type ProductTbProductTypeGoods =
  typeof product_tb_product_type_goods.$inferSelect;
export type NewProductTbProductTypeGoods =
  typeof product_tb_product_type_goods.$inferInsert;
