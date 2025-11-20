import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_product_variant } from "./product-variant";

// Product Packing
export const table_product_packing = pgTable(
  "product_packings",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    productVariantId: uuid("product_variant_id")
      .references(() => table_product_variant.id)
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
    index("product_packings_variant_idx").on(table.productVariantId),
    index("product_packings_active_idx").on(table.isActive),
  ]
);

export type TblProductPacking = typeof table_product_packing.$inferSelect;
export type NewTblProductPacking = typeof table_product_packing.$inferInsert;
