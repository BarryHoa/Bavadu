import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdBaseSchema } from "./schema";
import { table_location_countries } from "./base.country";

// Location Administrative Units - hierarchical structure for provinces, districts, wards, etc.
// Supports flexible levels: Level 1 (province/state), Level 2 (district - optional), Level 3 (ward/commune)
export const table_location_administrative_units = mdBaseSchema.table(
  "location_administrative_units",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`), // UUID v7
    countryId: uuid("country_id")
      .references(() => table_location_countries.id)
      .notNull(),
    code: varchar("code", { length: 50 }), // Optional code for the unit
    name: jsonb("name").notNull(), // LocalizeText - name of the administrative unit
    type: varchar("type", { length: 20 }).notNull(), // AdministrativeUnitType: province, state, district, ward, commune, etc.
    level: integer("level").notNull(), // 1 = province/state, 2 = district (optional), 3 = ward/commune
    parentId: uuid("parent_id"), // Reference to parent administrative unit (null for level 1)
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }), // uuid user id
    updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),
    index("location_administrative_units_country_idx").on(table.countryId),
    index("location_administrative_units_parent_idx").on(table.parentId),
    index("location_administrative_units_level_idx").on(table.level),
    index("location_administrative_units_type_idx").on(table.type),
    index("location_administrative_units_active_idx").on(table.isActive),
  ]
);

export type TblLocationAdministrativeUnit =
  typeof table_location_administrative_units.$inferSelect;
export type NewTblLocationAdministrativeUnit =
  typeof table_location_administrative_units.$inferInsert;
