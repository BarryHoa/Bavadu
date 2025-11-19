import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { table_product_variant } from "./product-variant";

// Product Type: Tool - Công cụ/Thiết bị
export const table_product_type_tool = pgTable(
  "product_type_tool",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    productVariantId: uuid("product_variant_id")
      .references(() => table_product_variant.id, { onDelete: "cascade" })
      .notNull()
      .unique(),

    // Identification
    serialNumber: varchar("serial_number", { length: 100 }).unique(),
    modelNumber: varchar("model_number", { length: 100 }),

    // Purchase info
    purchaseDate: timestamp("purchase_date", { withTimezone: true }),
    purchasePrice: numeric("purchase_price", { precision: 18, scale: 4 }),

    // Warranty & Maintenance
    warrantyPeriodMonths: integer("warranty_period_months"),
    maintenanceIntervalDays: integer("maintenance_interval_days"),
    lastMaintenanceDate: timestamp("last_maintenance_date", {
      withTimezone: true,
    }),
    nextMaintenanceDate: timestamp("next_maintenance_date", {
      withTimezone: true,
    }),

    // Status & Assignment
    status: varchar("status", { length: 20 }).default("in-use"), // in-use, maintenance, retired
    location: varchar("location", { length: 200 }),
    assignedToUserId: uuid("assigned_to_user_id"), // references users table

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("product_type_tool_variant_idx").on(table.productVariantId),
    index("product_type_tool_serial_idx").on(table.serialNumber),
    index("product_type_tool_status_idx").on(table.status),
    index("product_type_tool_assigned_idx").on(table.assignedToUserId),
    // Composite index for maintenance scheduling queries
    index("product_type_tool_status_next_maintenance_idx").on(
      table.status,
      table.nextMaintenanceDate
    ),
    // Composite index for assigned tools
    index("product_type_tool_assigned_status_idx").on(
      table.assignedToUserId,
      table.status
    ),
  ]
);

export type TblProductTypeTool = typeof table_product_type_tool.$inferSelect;
export type NewTblProductTypeTool = typeof table_product_type_tool.$inferInsert;
