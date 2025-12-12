import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlHrmSchema } from "./schema";

// Benefit Packages - Gói phúc lợi
export const hrm_tb_benefit_packages = mdlHrmSchema.table(
  "benefit_packages",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: jsonb("description"), // LocaleDataType<string>
    benefitType: varchar("benefit_type", { length: 50 }).notNull(), // insurance, allowance, bonus, etc.
    coverage: jsonb("coverage"), // Details of what's covered
    cost: integer("cost"), // Monthly/annual cost
    currency: varchar("currency", { length: 10 }).default("VND"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("benefit_packages_code_idx").on(table.code),
    index("benefit_packages_type_idx").on(table.benefitType),
    index("benefit_packages_active_idx").on(table.isActive),
  ]
);

export type HrmTbBenefitPackage = typeof hrm_tb_benefit_packages.$inferSelect;
export type NewHrmTbBenefitPackage = typeof hrm_tb_benefit_packages.$inferInsert;
