import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlProductSchema } from "./schema";
import { table_product_variant } from "./product.variant";

// Product Type: Asset - Tài sản cố định
export const table_product_type_asset = mdlProductSchema.table(
  "type_asset",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    productVariantId: uuid("product_variant_id")
      .references(() => table_product_variant.id, { onDelete: "cascade" })
      .notNull()
      .unique(),

    // Asset identification
    assetCode: varchar("asset_code", { length: 100 }).unique(),

    // Purchase info
    purchaseDate: timestamp("purchase_date", { withTimezone: true }),
    purchasePrice: numeric("purchase_price", { precision: 18, scale: 4 }),

    // Depreciation
    depreciationMethod: varchar("depreciation_method", { length: 30 }), // straight-line, declining-balance
    usefulLifeYears: integer("useful_life_years"),
    residualValue: numeric("residual_value", { precision: 18, scale: 4 }),
    depreciationRate: numeric("depreciation_rate", { precision: 5, scale: 2 }), // percentage
    depreciationStartDate: timestamp("depreciation_start_date", {
      withTimezone: true,
    }),
    currentValue: numeric("current_value", { precision: 18, scale: 4 }),

    // Assignment
    location: varchar("location", { length: 200 }),
    assignedToUserId: uuid("assigned_to_user_id"), // references users table

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("type_asset_variant_idx").on(table.productVariantId),
    index("type_asset_code_idx").on(table.assetCode),
    index("type_asset_assigned_idx").on(table.assignedToUserId),
    // Composite index for assigned assets query
    index("type_asset_assigned_location_idx").on(
      table.assignedToUserId,
      table.location
    ),
  ]
);

export type TblProductTypeAsset = typeof table_product_type_asset.$inferSelect;
export type NewTblProductTypeAsset =
  typeof table_product_type_asset.$inferInsert;
