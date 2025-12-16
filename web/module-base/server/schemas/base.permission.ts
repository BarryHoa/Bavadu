import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdBaseSchema } from "./schema";

// Permission Registry - Registry để quản lý tất cả permissions trong system
export const base_tb_permissions = mdBaseSchema.table(
  "permissions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Permission key: 'hrm.employee.view', 'product.item.create', etc.
    key: varchar("key", { length: 100 }).notNull().unique(),

    module: varchar("module", { length: 50 }).notNull(), // 'hrm', 'product', 'base'
    resource: varchar("resource", { length: 50 }).notNull(), // 'employee', 'product', etc.
    action: varchar("action", { length: 50 }).notNull(), // 'view', 'create', 'update', 'delete', 'list'

    name: jsonb("name").notNull(), // LocaleDataType<string>
    description: text("description"), // Text description

    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("permissions_module_idx").on(table.module),
    uniqueIndex("permissions_key_idx").on(table.key),
  ],
);

export type BaseTbPermission = typeof base_tb_permissions.$inferSelect;
export type NewBaseTbPermission = typeof base_tb_permissions.$inferInsert;
