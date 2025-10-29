import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  boolean,
  integer,
  decimal,
} from "drizzle-orm/pg-core";

// Product Categories
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  parentId: integer("parent_id").references(() => productCategories.id),
  level: integer("level").default(1),
  path: varchar("path", { length: 500 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;

// Brands
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logoUrl: varchar("logo_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;

// Units of Measure
export const unitsOfMeasure = pgTable("units_of_measure", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'weight', 'volume', 'length', 'area', 'count', 'time'
  baseUnitId: integer("base_unit_id").references(() => unitsOfMeasure.id),
  conversionFactor: decimal("conversion_factor", {
    precision: 15,
    scale: 6,
  }).default("1"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UnitOfMeasure = typeof unitsOfMeasure.$inferSelect;
export type NewUnitOfMeasure = typeof unitsOfMeasure.$inferInsert;

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  productType: varchar("product_type", { length: 20 }).notNull(), // 'storable', 'consumable', 'service', 'raw_material', 'finished_good', 'trading_good'
  categoryId: integer("category_id").references(() => productCategories.id),
  brandId: integer("brand_id").references(() => brands.id),
  unitOfMeasureId: integer("unit_of_measure_id")
    .references(() => unitsOfMeasure.id)
    .notNull(),
  isActive: boolean("is_active").default(true),
  isVariantEnabled: boolean("is_variant_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by"),
  updatedBy: integer("updated_by"),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
