import {
  boolean,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const table_stock_warehouse = pgTable(
  "stock_warehouses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 64 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    codeUniqueIdx: uniqueIndex("stock_warehouses_code_unique").on(table.code),
  })
);

export type TblStockWarehouse = typeof table_stock_warehouse.$inferSelect;
export type NewTblStockWarehouse = typeof table_stock_warehouse.$inferInsert;
