import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  numeric,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { base_tb_payment_terms } from "@base/server/schemas/base.payment-term";

import { mdlSaleB2bSchema } from "./schema";

// Customer Companies (B2B customers)
export const sale_b2c_tb_customer_companies = mdlSaleB2bSchema.table(
  "customers",
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
      () => base_tb_payment_terms.id,
      { onDelete: "set null" },
    ),
    isActive: boolean("is_active").default(true).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("customers_code_idx").on(table.code),
    index("customers_name_idx").on(table.name),
    index("customers_tax_id_idx").on(table.taxId),
    index("customers_active_idx").on(table.isActive),
  ],
);

export type SaleB2cTbCustomerCompany =
  typeof sale_b2c_tb_customer_companies.$inferSelect;
export type NewSaleB2cTbCustomerCompany =
  typeof sale_b2c_tb_customer_companies.$inferInsert;

// Customer Individuals (B2C customers) - Note: This should be in b2c-sales module
export const sale_b2c_tb_customers = mdlSaleB2bSchema.table(
  "customer_individuals",
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
    index("customer_individuals_code_idx").on(table.code),
    index("customer_individuals_name_idx").on(table.firstName, table.lastName),
    index("customer_individuals_phone_idx").on(table.phone),
    index("customer_individuals_email_idx").on(table.email),
    index("customer_individuals_active_idx").on(table.isActive),
  ],
);

export type SaleB2cTbCustomer = typeof sale_b2c_tb_customers.$inferSelect;
export type NewSaleB2cTbCustomer = typeof sale_b2c_tb_customers.$inferInsert;
