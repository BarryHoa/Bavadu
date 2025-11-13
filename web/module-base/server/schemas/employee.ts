import { sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { table_user } from "./user";

export const table_employee = pgTable(
  "employees",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`),
    userId: uuid("user_id")
      .references(() => table_user.id, { onDelete: "set null" })
      .$type<string | null>(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    position: varchar("position", { length: 100 }),
    department: varchar("department", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    salary: varchar("salary", { length: 50 }),
    address: jsonb("address"),
    notes: varchar("notes", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailUniqueIdx: uniqueIndex("employees_email_unique").on(table.email),
  })
);

export type TblEmployee = typeof table_employee.$inferSelect;
export type NewTblEmployee = typeof table_employee.$inferInsert;

