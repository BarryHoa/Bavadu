import { sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlProductSchema } from "./schema";

// Units of Measure
export const product_tb_units_of_measure = mdlProductSchema.table(
  "units_of_measure",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    symbol: varchar("symbol", { length: 20 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }), // uuid user id
    updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
  },
  (table) => [
    index("units_of_measure_symbol_idx").on(table.symbol),
    index("units_of_measure_active_idx").on(table.isActive),
  ]
);

export type ProductTbUnitOfMeasure = typeof product_tb_units_of_measure.$inferSelect;
export type NewProductTbUnitOfMeasure = typeof product_tb_units_of_measure.$inferInsert;

// Unit of Measure Conversions
export const product_tb_uom_conversions = mdlProductSchema.table(
  "uom_conversions",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
    uomId: uuid("uom_id")
      .references(() => product_tb_units_of_measure.id)
      .notNull(),
    conversionRatio: decimal("conversion_ratio", {
      precision: 15,
      scale: 6,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }), // uuid user id
    updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
  },
  (table) => [index("uom_conversions_uom_idx").on(table.uomId)]
);

export type ProductTbUomConversion = typeof product_tb_uom_conversions.$inferSelect;
export type NewProductTbUomConversion = typeof product_tb_uom_conversions.$inferInsert;

