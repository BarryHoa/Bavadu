import { base_tb_payment_methods } from "@base/server/schemas/base.payment-method";
import { sale_b2c_tb_price_lists } from "./b2c-sales.price-list";
import { base_tb_shipping_methods } from "@base/server/schemas/base.shipping-method";
import { base_tb_shipping_terms } from "@base/server/schemas/base.shipping-term";
import { stock_tb_stock_warehouses } from "@mdl/stock/server/schemas/stock.warehouse";
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

export const sale_b2c_tb_orders = mdlSaleB2cSchema.table(
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
      () => base_tb_payment_methods.id,
      { onDelete: "set null" }
    ),
    shippingMethodId: uuid("shipping_method_id").references(
      () => base_tb_shipping_methods.id,
      { onDelete: "set null" }
    ),
    shippingTermsId: uuid("shipping_terms_id").references(
      () => base_tb_shipping_terms.id,
      { onDelete: "set null" }
    ),
    requireInvoice: boolean("require_invoice").default(false).notNull(),

    // Pricing
    priceListId: uuid("price_list_id").references(
      () => sale_b2c_tb_price_lists.id,
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

export type SaleB2cTbOrder = typeof sale_b2c_tb_orders.$inferSelect;
export type NewSaleB2cTbOrder = typeof sale_b2c_tb_orders.$inferInsert;
