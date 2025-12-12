import { sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  numeric,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdlStockSchema } from "./schema";

import { base_tb_users } from "@base/server/schemas/base.user";
import {
  WarehouseAddress,
  warehouseStatuses,
  warehouseValuationMethods,
} from "../../common/constants";

export const stock_tb_stock_warehouses = mdlStockSchema.table(
  "warehouses",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    code: varchar("code", { length: 64 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    typeCode: varchar("type_code", { length: 30 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("ACTIVE"),
    companyId: uuid("company_id"),
    managerId: uuid("manager_id").references(() => base_tb_users.id, {
      onDelete: "set null",
    }),
    contactId: uuid("contact_id").references(() => base_tb_users.id, {
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
    uniqueIndex("warehouses_code_unique").on(table.code),
    index("warehouses_company_idx").on(table.companyId),
    index("warehouses_status_idx").on(table.status),
    index("warehouses_type_idx").on(table.typeCode),
    check(
      "warehouses_status_check",
      sql`${table.status} IN (${sql.join(
        warehouseStatuses.map((status) => sql.raw(`'${status}'`)),
        sql`, `
      )})`
    ),
    check(
      "warehouses_valuation_check",
      sql`${table.valuationMethod} IN (${sql.join(
        warehouseValuationMethods.map((method) => sql.raw(`'${method}'`)),
        sql`, `
      )})`
    ),
    check(
      "warehouses_min_stock_check",
      sql`${table.minStock}::numeric >= 0`
    ),
    check(
      "warehouses_min_max_check",
      sql`(${table.maxStock} IS NULL) OR (${table.maxStock}::numeric >= ${table.minStock}::numeric)`
    ),
  ]
);

export type StockTbStockWarehouse = typeof stock_tb_stock_warehouses.$inferSelect;
export type NewStockTbStockWarehouse = typeof stock_tb_stock_warehouses.$inferInsert;
