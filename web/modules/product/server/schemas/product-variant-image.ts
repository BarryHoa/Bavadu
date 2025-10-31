import { pgTable, uuid, text, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { productVariants } from "./product-variant";

export const productVariantImages = pgTable("product_variant_images", {
	id: uuid("id").primaryKey().defaultRandom(),
	variantId: uuid("variant_id").references(() => productVariants.id).notNull(),
	url: text("url").notNull(),
	alt: jsonb("alt"),
	sortOrder: integer("sort_order").default(0).notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export type ProductVariantImage = typeof productVariantImages.$inferSelect;
export type NewProductVariantImage = typeof productVariantImages.$inferInsert;
