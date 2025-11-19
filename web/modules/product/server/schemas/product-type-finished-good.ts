import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_product_variant } from "./product-variant";

// Product Type: Finished Good - Thành phẩm sản xuất
export const table_product_type_finished_good = pgTable(
  "product_type_finished_good",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
    productVariantId: uuid("product_variant_id")
      .references(() => table_product_variant.id, { onDelete: "cascade" })
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
    index("product_type_finished_good_variant_idx").on(
      table.productVariantId
    ),
    index("product_type_finished_good_bom_idx").on(table.billOfMaterialsId),
  ]
);

export type TblProductTypeFinishedGood =
  typeof table_product_type_finished_good.$inferSelect;
export type NewTblProductTypeFinishedGood =
  typeof table_product_type_finished_good.$inferInsert;

