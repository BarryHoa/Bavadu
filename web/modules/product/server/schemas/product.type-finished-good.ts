import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlProductSchema } from "./schema";
import { product_tb_product_variants } from "./product.variant";

// Product Type: Finished Good - Thành phẩm sản xuất
export const product_tb_product_type_finished_goods = mdlProductSchema.table(
  "type_finished_good",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
    productVariantId: uuid("product_variant_id")
      .references(() => product_tb_product_variants.id, { onDelete: "cascade" })
      .notNull()
      .unique(),

    // Pricing
    defaultSalePrice: numeric("default_sale_price", {
      precision: 18,
      scale: 4,
    }),
    defaultManufacturingCost: numeric("default_manufacturing_cost", {
      precision: 18,
      scale: 4,
    }),

    // Manufacturing
    billOfMaterialsId: uuid("bom_id"), // references BOM table (if exists)
    productionTime: integer("production_time"), // minutes
    productionUnit: varchar("production_unit", { length: 50 }),

    // Quality
    qualityStandard: text("quality_standard"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("type_finished_good_variant_idx").on(
      table.productVariantId
    ),
    index("type_finished_good_bom_idx").on(table.billOfMaterialsId),
  ]
);

export type ProductTbProductTypeFinishedGood =
  typeof product_tb_product_type_finished_goods.$inferSelect;
export type NewProductTbProductTypeFinishedGood =
  typeof product_tb_product_type_finished_goods.$inferInsert;

