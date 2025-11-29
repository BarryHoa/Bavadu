import { table_payment_term } from "@base/server/schemas/payment-term";
import { table_shipping_method } from "@base/server/schemas/shipping-method";
import { table_shipping_term } from "@base/server/schemas/shipping-term";
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_stock_warehouse } from "../../../../stock/server/schemas/warehouse";

export const table_sales_order_b2b = pgTable(
  "sales_orders_b2b",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 64 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),

    // B2B specific customer info
    companyName: varchar("company_name", { length: 256 }).notNull(),
    taxId: varchar("tax_id", { length: 50 }),
    contactPerson: varchar("contact_person", { length: 128 }),
    contactPhone: varchar("contact_phone", { length: 20 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    companyAddress: text("company_address"),

    // Business fields
    paymentTermsId: uuid("payment_terms_id").references(
      () => table_payment_term.id,
      { onDelete: "set null" }
    ),
    creditLimit: numeric("credit_limit", { precision: 14, scale: 2 }),
    invoiceRequired: boolean("invoice_required").default(true).notNull(),
    shippingMethodId: uuid("shipping_method_id").references(
      () => table_shipping_method.id,
      { onDelete: "set null" }
    ),
    shippingTermsId: uuid("shipping_terms_id").references(
      () => table_shipping_term.id,
      { onDelete: "set null" }
    ),

    // Common fields
    warehouseId: uuid("warehouse_id").references(
      () => table_stock_warehouse.id,
      { onDelete: "set null" }
    ),
    expectedDate: timestamp("expected_date", { withTimezone: true }),

    // Pricing fields
    subtotal: numeric("subtotal", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    totalDiscount: numeric("total_discount", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    totalTax: numeric("total_tax", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    shippingFee: numeric("shipping_fee", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    grandTotal: numeric("grand_total", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    totalAmount: numeric("total_amount", { precision: 14, scale: 2 })
      .notNull()
      .default("0"), // Alias for grandTotal for compatibility
    currency: varchar("currency", { length: 8 }).default("USD"),
    currencyRate: numeric("currency_rate", { precision: 14, scale: 6 }),

    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    index("sales_orders_b2b_code_idx").on(table.code),
    index("sales_orders_b2b_company_idx").on(table.companyName),
    index("sales_orders_b2b_status_idx").on(table.status),
    index("sales_orders_b2b_warehouse_idx").on(table.warehouseId),
    index("sales_orders_b2b_expected_idx").on(table.expectedDate),
    index("sales_orders_b2b_created_idx").on(table.createdAt),
  ]
);

export type TblSalesOrderB2B = typeof table_sales_order_b2b.$inferSelect;
export type NewTblSalesOrderB2B = typeof table_sales_order_b2b.$inferInsert;
