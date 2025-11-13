import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { table_user } from "@base/server/schemas/user";
import {
  WarehouseAddress,
  WarehouseStatus,
  WarehouseValuationMethod,
  warehouseStatuses,
  warehouseValuationMethods,
} from "../../common/constants";

export const table_stock_warehouse = pgTable(
  "stock_warehouses",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 64 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    typeCode: varchar("type_code", { length: 30 }).notNull(),
    status: varchar("status", { length: 20 })
      .notNull()
      .default("ACTIVE"),
    companyId: uuid("company_id"),
    managerId: uuid("manager_id").references(() => table_user.id, {
      onDelete: "set null",
    }),
    contactId: uuid("contact_id").references(() => table_user.id, {
      onDelete: "set null",
    }),
    address: jsonb("address").$type<WarehouseAddress>().notNull(),
    valuationMethod: varchar("valuation_method", { length: 10 })
      .notNull()
      .default("FIFO"),
    minStock: numeric("min_stock", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    maxStock: numeric("max_stock", { precision: 18, scale: 4 }),
    accountInventory: varchar("account_inventory", { length: 30 }),
    accountAdjustment: varchar("account_adjustment", { length: 30 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("stock_warehouses_code_unique").on(table.code),
    index("stock_warehouses_company_idx").on(table.companyId),
    index("stock_warehouses_status_idx").on(table.status),
    index("stock_warehouses_type_idx").on(table.typeCode),
    check(
      "stock_warehouses_status_check",
      sql`${table.status} IN (${sql.join(
        warehouseStatuses.map((status) => sql`${status}`),
        sql`, `
      )})`
    ),
    check(
      "stock_warehouses_valuation_check",
      sql`${table.valuationMethod} IN (${sql.join(
        warehouseValuationMethods.map((method) => sql`${method}`),
        sql`, `
      )})`
    ),
    check(
      "stock_warehouses_min_stock_check",
      sql`${table.minStock}::numeric >= 0`
    ),
    check(
      "stock_warehouses_min_max_check",
      sql`(${table.maxStock} IS NULL) OR (${table.maxStock}::numeric >= ${table.minStock}::numeric)`
    ),
  ]
);

export type TblStockWarehouse = typeof table_stock_warehouse.$inferSelect;
export type NewTblStockWarehouse = typeof table_stock_warehouse.$inferInsert;
