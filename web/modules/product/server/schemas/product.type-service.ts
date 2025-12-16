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

import { product_tb_product_variants } from "./product.variant";
import { mdlProductSchema } from "./schema";

// Product Type: Service - Dịch vụ
export const product_tb_product_type_services = mdlProductSchema.table(
  "type_service",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    productVariantId: uuid("product_variant_id")
      .references(() => product_tb_product_variants.id, { onDelete: "cascade" })
      .notNull()
      .unique(),

    // Pricing
    defaultServicePrice: numeric("default_service_price", {
      precision: 18,
      scale: 4,
    }),

    // Service details
    unit: varchar("unit", { length: 20 }), // hour, day, month, project
    duration: integer("duration"), // in unit
    detailedDescription: text("detailed_description"),
    specialRequirements: text("special_requirements"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("type_service_variant_idx").on(table.productVariantId)],
);

export type ProductTbProductTypeService =
  typeof product_tb_product_type_services.$inferSelect;
export type NewProductTbProductTypeService =
  typeof product_tb_product_type_services.$inferInsert;
