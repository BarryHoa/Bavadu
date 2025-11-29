import { sql } from "drizzle-orm";
import {
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_stock_warehouse } from "../../../../stock/server/schemas/warehouse";

// Sales Order Delivery - Track deliveries from orders (warehouse receipts)
export const table_sales_order_delivery = pgTable(
  "sales_order_deliveries",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    orderType: varchar("order_type", { length: 10 }).notNull(), // 'B2B' | 'B2C'
    orderId: uuid("order_id").notNull(),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => table_stock_warehouse.id, { onDelete: "restrict" }),
    deliveryDate: timestamp("delivery_date", { withTimezone: true }).notNull(),
    reference: varchar("reference", { length: 128 }), // Reference number for the delivery
    note: text("note"),
    status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, completed, cancelled
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
  },
  (table) => [
    index("sales_order_deliveries_order_idx").on(table.orderType, table.orderId),
    index("sales_order_deliveries_warehouse_idx").on(table.warehouseId),
    index("sales_order_deliveries_date_idx").on(table.deliveryDate),
    index("sales_order_deliveries_status_idx").on(table.status),
  ]
);

export type TblSalesOrderDelivery = typeof table_sales_order_delivery.$inferSelect;
export type NewTblSalesOrderDelivery = typeof table_sales_order_delivery.$inferInsert;

// Delivery Lines - Track which order lines are delivered
export const table_sales_order_delivery_line = pgTable(
  "sales_order_delivery_lines",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    deliveryId: uuid("delivery_id")
      .notNull()
      .references(() => table_sales_order_delivery.id, { onDelete: "cascade" }),
    orderType: varchar("order_type", { length: 10 }).notNull(), // 'B2B' | 'B2C'
    orderLineId: uuid("order_line_id").notNull(), // Reference to order line (B2B or B2C)
    quantity: numeric("quantity", { precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("sales_order_delivery_lines_delivery_idx").on(table.deliveryId),
    index("sales_order_delivery_lines_order_line_idx").on(table.orderType, table.orderLineId),
  ]
);

export type TblSalesOrderDeliveryLine = typeof table_sales_order_delivery_line.$inferSelect;
export type NewTblSalesOrderDeliveryLine = typeof table_sales_order_delivery_line.$inferInsert;

