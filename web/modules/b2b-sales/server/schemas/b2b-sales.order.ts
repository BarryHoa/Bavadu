import { base_tb_payment_terms } from "@base/server/schemas/base.payment-term";
import { base_tb_shipping_methods } from "@base/server/schemas/base.shipping-method";
import { base_tb_shipping_terms } from "@base/server/schemas/base.shipping-term";
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
import { mdlSaleB2bSchema } from "./schema";
import { stock_tb_stock_warehouses } from "@mdl/stock/server/schemas/stock.warehouse";

export const sale_b2b_tb_orders = mdlSaleB2bSchema.table(
  "orders",
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
      () => base_tb_payment_terms.id,
      { onDelete: "set null" }
    ),
    creditLimit: numeric("credit_limit", { precision: 14, scale: 2 }),
    invoiceRequired: boolean("invoice_required").default(true).notNull(),
    shippingMethodId: uuid("shipping_method_id").references(
      () => base_tb_shipping_methods.id,
      { onDelete: "set null" }
    ),
    shippingTermsId: uuid("shipping_terms_id").references(
      () => base_tb_shipping_terms.id,
      { onDelete: "set null" }
    ),

    // Common fields
    warehouseId: uuid("warehouse_id").references(
      () => stock_tb_stock_warehouses.id,
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
    index("orders_code_idx").on(table.code),
    index("orders_company_idx").on(table.companyName),
    index("orders_status_idx").on(table.status),
    index("orders_warehouse_idx").on(table.warehouseId),
    index("orders_expected_idx").on(table.expectedDate),
    index("orders_created_idx").on(table.createdAt),
  ]
);

export type SaleB2bTbOrder = typeof sale_b2b_tb_orders.$inferSelect;
export type NewSaleB2bTbOrder = typeof sale_b2b_tb_orders.$inferInsert;
