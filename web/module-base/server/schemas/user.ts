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

// Users
export const table_user = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().default(sql`uuid_generate_v7()`), // UUID v7
    avatar: varchar("avatar", { length: 512 }),
    gender: varchar("gender", { length: 10 }), // 'male', 'female', 'other'
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
    bio: varchar("bio", { length: 120 }),
    firstName: varchar("first_name", { length: 50 }),
    lastName: varchar("last_name", { length: 50 }),
    phones: varchar("phones", { length: 20 }).array(),
    addresses: varchar("addresses", { length: 225 }).array(),
    emails: varchar("emails", { length: 255 }).array(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    position: varchar("position", { length: 100 }),
    department: varchar("department", { length: 100 }),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    salary: varchar("salary", { length: 50 }),
    address: jsonb("address"),
    notes: varchar("notes", { length: 255 }),
    status: varchar("status", { length: 20 })
      .default("active")
      .notNull(), // 'active', 'inactive', 'block'
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }), // uuid user id
    updatedBy: varchar("updated_by", { length: 36 }), // uuid user id
  },
  (table) => ({
    emailUniqueIdx: uniqueIndex("users_email_unique").on(table.email),
  })
);

export type TblUser = typeof table_user.$inferSelect;
export type NewTblUser = typeof table_user.$inferInsert;

// Users Login
export const table_user_login = pgTable("users_login", {
  userId: uuid("user_id")
    .notNull()
    .references(() => table_user.id),
  username: varchar("username", { length: 50 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  lastLoginIp: varchar("last_login_ip", { length: 45 }),
  lastLoginUserAgent: varchar("last_login_user_agent", { length: 255 }),
  lastLoginLocation: varchar("last_login_location", { length: 255 }),
  lastLoginDevice: varchar("last_login_device", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export type TblUserLogin = typeof table_user_login.$inferSelect;
export type NewTblUserLogin = typeof table_user_login.$inferInsert;

