import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

// Product Packing
export const productPackings = pgTable("product_packings", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: jsonb("name").notNull(), // LocaleDataType<string>
  description: jsonb("description"), // LocaleDataType<string>
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  createdBy: varchar("created_by", { length: 36 }), // uuid user id
  updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
});

export type ProductPacking = typeof productPackings.$inferSelect;
export type NewProductPacking = typeof productPackings.$inferInsert;

