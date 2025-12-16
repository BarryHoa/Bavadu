import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdlProductSchema } from "./schema";
import { product_tb_product_variants } from "./product.variant";

// Product Packing
export const product_tb_product_packings = mdlProductSchema.table(
  "packings",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    productVariantId: uuid("product_variant_id")
      .references(() => product_tb_product_variants.id)
      .notNull(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: text("description"), // string
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }), // uuid user id
    updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
  },
  (table) => [
    index("packings_variant_idx").on(table.productVariantId),
    index("packings_active_idx").on(table.isActive),
  ],
);

export type ProductTbProductPacking =
  typeof product_tb_product_packings.$inferSelect;
export type NewProductTbProductPacking =
  typeof product_tb_product_packings.$inferInsert;
