import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlProductSchema } from "./schema";
import { product_tb_product_variants } from "./product.variant";

// Product Attributes (junction table)
export const product_tb_product_attributes = mdlProductSchema.table(
  "attributes",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
    productVariantId: uuid("product_variant_id")
      .references(() => product_tb_product_variants.id)
      .notNull(),
    code: varchar("code", { length: 100 }).notNull(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    value: text("value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }), // uuid user id
    updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
  },
  (table) => [
    index("attributes_variant_idx").on(table.productVariantId),
    index("attributes_code_idx").on(table.code),
  ]
);

export type ProductTbProductAttribute = typeof product_tb_product_attributes.$inferSelect;
export type NewProductTbProductAttribute = typeof product_tb_product_attributes.$inferInsert;

