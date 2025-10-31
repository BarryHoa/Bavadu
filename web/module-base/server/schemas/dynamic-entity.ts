import { pgTable, uuid, varchar, boolean, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

// Dynamic Entities allow defining custom fields per model and can be nested via parentId
export const dynamicEntities = pgTable("dynamic_entities", {
	id: uuid("id").primaryKey().defaultRandom(),
	code: varchar("code", { length: 20 }).notNull(),
	name: jsonb("name").notNull(), // LocaleDataType<string>
	description: jsonb("description"), // LocaleDataType<string>
	model: varchar("model", { length: 30 }).notNull(), // e.g. "product", "customer", "supplier", etc.
	dataType: varchar("data_type", { length: 20 }).notNull(), // string | number | boolean | date | select | multi-select
	options: jsonb("options"), // [{ label: LocaleDataType<string>, value: any }]
	defaultValue: jsonb("default_value"),
	isRequired: boolean("is_required").default(false).notNull(),
	validation: jsonb("validation"), // array of validation rules
	useIn: jsonb("use_in"), // { report?: boolean; list?: boolean; filter?: boolean }
	isActive: boolean("is_active").default(true).notNull(),
	order: integer("order").default(0).notNull(),
	parentId: uuid("parent_id").references((): any => dynamicEntities.id), // self-reference
	createdAt: timestamp("created_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }),
	createdBy: varchar("created_by", { length: 36 }),
	updatedBy: varchar("updated_by", { length: 36 }),
});

export type DynamicEntityRow = typeof dynamicEntities.$inferSelect;
export type NewDynamicEntityRow = typeof dynamicEntities.$inferInsert;


