import { table_payment_method } from "@base/server/schemas/base.payment-method";
import { table_price_lists_b2c } from "./b2c-sales.price-list";
import { table_shipping_method } from "@base/server/schemas/base.shipping-method";
import { table_shipping_term } from "@base/server/schemas/base.shipping-term";
import { table_stock_warehouse } from "@mdl/stock/server/schemas/stock.warehouse";
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
import { mdlSaleB2cSchema } from "./schema";

export const table_sales_order_b2c = mdlSaleB2cSchema.table(
  "orders",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 64 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),

    // B2C specific customer info
    customerName: varchar("customer_name", { length: 128 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 20 }),
    customerEmail: varchar("customer_email", { length: 255 }),
    deliveryAddress: text("delivery_address"),

    // Business fields
    paymentMethodId: uuid("payment_method_id").references(
      () => table_payment_method.id,
      { onDelete: "set null" }
    ),
    shippingMethodId: uuid("shipping_method_id").references(
      () => table_shipping_method.id,
      { onDelete: "set null" }
    ),
    shippingTermsId: uuid("shipping_terms_id").references(
      () => table_shipping_term.id,
      { onDelete: "set null" }
    ),
    requireInvoice: boolean("require_invoice").default(false).notNull(),

    // Pricing
    priceListId: uuid("price_list_id").references(
      () => table_price_lists_b2c.id,
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

    // B2C specific
    completedAt: timestamp("completed_at", { withTimezone: true }),

    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    index("orders_code_idx").on(table.code),
    index("orders_customer_idx").on(table.customerName),
    index("orders_status_idx").on(table.status),
    index("orders_warehouse_idx").on(table.warehouseId),
    index("orders_expected_idx").on(table.expectedDate),
    index("orders_created_idx").on(table.createdAt),
    index("orders_completed_idx").on(table.completedAt),
    index("orders_price_list_idx").on(table.priceListId),
  ]
);

export type TblSalesOrderB2C = typeof table_sales_order_b2c.$inferSelect;
export type NewTblSalesOrderB2C = typeof table_sales_order_b2c.$inferInsert;
