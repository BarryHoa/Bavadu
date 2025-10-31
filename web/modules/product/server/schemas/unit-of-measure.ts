import { pgTable, varchar, timestamp, boolean, decimal, uuid, jsonb } from "drizzle-orm/pg-core";

// Units of Measure
export const unitsOfMeasure = pgTable("units_of_measure", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: jsonb("name").notNull(), // LocaleDataType<string>
  symbol: varchar("symbol", { length: 20 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export type UnitOfMeasure = typeof unitsOfMeasure.$inferSelect;
export type NewUnitOfMeasure = typeof unitsOfMeasure.$inferInsert;

// Unit of Measure Conversions
export const uomConversions = pgTable("uom_conversions", {
  id: uuid("id").primaryKey().defaultRandom(),
  uomId: uuid("uom_id").references(() => unitsOfMeasure.id).notNull(),
  conversionRatio: decimal("conversion_ratio", {
    precision: 15,
    scale: 6,
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export type UomConversion = typeof uomConversions.$inferSelect;
export type NewUomConversion = typeof uomConversions.$inferInsert;

