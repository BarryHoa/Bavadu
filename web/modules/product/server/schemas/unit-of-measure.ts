import { sql } from "drizzle-orm";
import {
  boolean,
  decimal,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Units of Measure
export const table_unit_of_measure = pgTable("units_of_measure", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
  name: jsonb("name").notNull(), // LocaleDataType<string>
  symbol: varchar("symbol", { length: 20 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  createdBy: varchar("created_by", { length: 36 }), // uuid user id
  updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
});

export type TblUnitOfMeasure = typeof table_unit_of_measure.$inferSelect;
export type NewTblUnitOfMeasure = typeof table_unit_of_measure.$inferInsert;

// Unit of Measure Conversions
export const table_uom_conversion = pgTable("uom_conversions", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
  uomId: uuid("uom_id")
    .references(() => table_unit_of_measure.id)
    .notNull(),
  conversionRatio: decimal("conversion_ratio", {
    precision: 15,
    scale: 6,
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  createdBy: varchar("created_by", { length: 36 }), // uuid user id
  updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
});

export type TblUomConversion = typeof table_uom_conversion.$inferSelect;
export type NewTblUomConversion = typeof table_uom_conversion.$inferInsert;

