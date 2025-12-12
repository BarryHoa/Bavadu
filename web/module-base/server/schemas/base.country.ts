import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdBaseSchema } from "./schema";

// Location Countries
export const table_location_countries = mdBaseSchema.table(
  "location_countries",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`), // UUID v7
    code: varchar("code", { length: 2 }).notNull().unique(), // ISO country code: VN, US, UK, etc.
    name: jsonb("name").notNull(), // LocalizeText - country name
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }), // uuid user id
    updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
  },
  (table) => [
    index("location_countries_code_idx").on(table.code),
    index("location_countries_is_active_idx").on(table.isActive),
  ]
);

export type TblLocationCountry = typeof table_location_countries.$inferSelect;
export type NewTblLocationCountry =
  typeof table_location_countries.$inferInsert;
