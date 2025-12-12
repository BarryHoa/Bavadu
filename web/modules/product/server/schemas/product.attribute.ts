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
import { table_product_variant } from "./product.variant";

// Product Attributes (junction table)
export const table_product_attribute = mdlProductSchema.table(
  "attributes",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
    productVariantId: uuid("product_variant_id")
      .references(() => table_product_variant.id)
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

export type TblProductAttribute = typeof table_product_attribute.$inferSelect;
export type NewTblProductAttribute = typeof table_product_attribute.$inferInsert;

