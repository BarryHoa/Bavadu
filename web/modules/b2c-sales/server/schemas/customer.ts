import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  numeric,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlSaleB2cSchema } from "./schema";
import { table_payment_term } from "@base/server/schemas/payment-term";

// Customer Companies (B2B customers) - Note: This should be in b2b-sales module
export const table_customer_company = mdlSaleB2cSchema.table(
  "customer_companies",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 64 }).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    taxId: varchar("tax_id", { length: 50 }),
    address: text("address"),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    website: varchar("website", { length: 255 }),
    contactPerson: varchar("contact_person", { length: 128 }),
    creditLimit: numeric("credit_limit", { precision: 14, scale: 2 }),
    paymentTermsId: uuid("payment_terms_id").references(
      () => table_payment_term.id,
      { onDelete: "set null" }
    ),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("customer_companies_code_idx").on(table.code),
    index("customer_companies_name_idx").on(table.name),
    index("customer_companies_tax_id_idx").on(table.taxId),
    index("customer_companies_active_idx").on(table.isActive),
  ]
);

export type TblCustomerCompany = typeof table_customer_company.$inferSelect;
export type NewTblCustomerCompany = typeof table_customer_company.$inferInsert;

// Customer Individuals (B2C customers)
export const table_customer_individual = mdlSaleB2cSchema.table(
  "customers",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 64 }).notNull(),
    firstName: varchar("first_name", { length: 128 }).notNull(),
    lastName: varchar("last_name", { length: 128 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    address: text("address"),
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
    gender: varchar("gender", { length: 10 }), // 'male', 'female', 'other'
    isActive: boolean("is_active").default(true).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("customers_code_idx").on(table.code),
    index("customers_name_idx").on(table.firstName, table.lastName),
    index("customers_phone_idx").on(table.phone),
    index("customers_email_idx").on(table.email),
    index("customers_active_idx").on(table.isActive),
  ]
);

export type TblCustomerIndividual = typeof table_customer_individual.$inferSelect;
export type NewTblCustomerIndividual = typeof table_customer_individual.$inferInsert;

