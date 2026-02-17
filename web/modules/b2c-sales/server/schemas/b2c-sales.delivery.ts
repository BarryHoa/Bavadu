import { sql } from "drizzle-orm";
import {
  index,
  numeric,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { stock_tb_stock_warehouses } from "@mdl/stock/server/schemas/stock.warehouse";

import { mdlSaleB2cSchema } from "./schema";

// Sales Order Delivery - Track deliveries from orders (warehouse receipts)
export const sale_b2c_tb_deliveries = mdlSaleB2cSchema.table(
  "deliveries",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    orderType: varchar("order_type", { length: 10 }).notNull(), // 'B2B' | 'B2C'
    orderId: uuid("order_id").notNull(),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => stock_tb_stock_warehouses.id, { onDelete: "restrict" }),
    deliveryDate: timestamp("delivery_date", { withTimezone: true }).notNull(),
    reference: varchar("reference", { length: 128 }), // Reference number for the delivery
    note: text("note"),
    status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, completed, cancelled
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    index("deliveries_order_idx").on(table.orderType, table.orderId),
    index("deliveries_warehouse_idx").on(table.warehouseId),
    index("deliveries_date_idx").on(table.deliveryDate),
    index("deliveries_status_idx").on(table.status),
  ],
);

export type SaleB2cTbDelivery = typeof sale_b2c_tb_deliveries.$inferSelect;
export type NewSaleB2cTbDelivery = typeof sale_b2c_tb_deliveries.$inferInsert;

// Delivery Lines - Track which order lines are delivered
export const sale_b2c_tb_delivery_lines = mdlSaleB2cSchema.table(
  "delivery_lines",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    deliveryId: uuid("delivery_id")
      .notNull()
      .references(() => sale_b2c_tb_deliveries.id, { onDelete: "cascade" }),
    orderType: varchar("order_type", { length: 10 }).notNull(), // 'B2B' | 'B2C'
    orderLineId: uuid("order_line_id").notNull(), // Reference to order line (B2B or B2C)
    quantity: numeric("quantity", { precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("delivery_lines_delivery_idx").on(table.deliveryId),
    index("delivery_lines_order_line_idx").on(
      table.orderType,
      table.orderLineId,
    ),
  ],
);

export type SaleB2cTbDeliveryLine =
  typeof sale_b2c_tb_delivery_lines.$inferSelect;
export type NewSaleB2cTbDeliveryLine =
  typeof sale_b2c_tb_delivery_lines.$inferInsert;
