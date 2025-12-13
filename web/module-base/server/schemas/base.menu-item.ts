import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mdBaseSchema } from "./schema";

// Menu Items - Dynamic menu management with permission-based visibility
export const base_tb_menu_items = mdBaseSchema.table(
  "menu_items",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Module và key
    module: varchar("module", { length: 50 }).notNull(), // 'base', 'hrm', 'product', etc.
    key: varchar("key", { length: 100 }).notNull(), // Unique key: 'hrm-employees', 'hrm-org', etc.

    // Hierarchical structure - Self-referencing (FK will be added in migration)
    parentId: uuid("parent_id"),

    // Display properties
    name: jsonb("name").notNull(), // LocaleDataType<string> - Multi-language support
    icon: varchar("icon", { length: 50 }), // Icon name
    order: integer("order").default(0).notNull(),
    badge: varchar("badge", { length: 20 }), // Optional badge text

    // Navigation
    path: varchar("path", { length: 255 }), // Route path
    as: varchar("as", { length: 255 }), // Alias path

    // Type và visibility
    type: varchar("type", { length: 20 }).notNull().default("mdl"), // 'main' | 'mdl'
    isVisible: boolean("is_visible").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),

    // Permissions - Required permissions để access menu này
    requiredPermissions: jsonb("required_permissions"), // Array of permission strings: ['hrm.employee.view', 'hrm.employee.list']
    permissionMode: varchar("permission_mode", { length: 20 }).default("any"), // 'any' | 'all' - any = OR, all = AND

    // Metadata
    metadata: jsonb("metadata"), // Additional config: { target: '_blank', external: true }

    // Audit
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    uniqueIndex("menu_items_module_key_idx").on(table.module, table.key),
    index("menu_items_parent_idx").on(table.parentId),
    index("menu_items_module_idx").on(table.module),
    index("menu_items_active_idx").on(table.isActive, table.isVisible),
    index("menu_items_order_idx").on(table.order),
  ]
);

export type BaseTbMenuItem = typeof base_tb_menu_items.$inferSelect;
export type NewBaseTbMenuItem = typeof base_tb_menu_items.$inferInsert;
