import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mdBaseSchema } from "./schema";

/**
 * Users = person (cá nhân). Thông tin cá nhân lưu ở đây.
 * Employee = extension HR, link qua user_id.
 */
export const base_tb_users = mdBaseSchema.table(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Identity
    firstName: varchar("first_name", { length: 50 }),
    lastName: varchar("last_name", { length: 50 }),
    avatar: varchar("avatar", { length: 512 }),
    dateOfBirth: timestamp("date_of_birth", { withTimezone: true }),
    gender: varchar("gender", { length: 10 }),

    // Contact (arrays; primary email/phone thường ở users_login)
    emails: varchar("emails", { length: 255 }).array(),
    phones: varchar("phones", { length: 20 }).array(),
    addresses: varchar("addresses", { length: 225 }).array(),
    address: jsonb("address"),

    // Meta
    bio: varchar("bio", { length: 120 }),
    notes: varchar("notes", { length: 255 }),
    status: varchar("status", { length: 20 }).default("active").notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("users_status_idx").on(table.status),
    index("users_lastname_idx").on(table.lastName),
    index("users_firstname_idx").on(table.firstName),
  ],
);

export type BaseTbUser = typeof base_tb_users.$inferSelect;
export type NewBaseTbUser = typeof base_tb_users.$inferInsert;

/**
 * Users Login = credential (đăng nhập). 1 user có thể có nhiều login (username/email/phone).
 */
export const base_tb_users_login = mdBaseSchema.table(
  "users_login",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => base_tb_users.id),
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
    createdBy: varchar("created_by", { length: 36 }),
    updatedBy: varchar("updated_by", { length: 36 }),
  },
  (table) => [
    index("users_login_user_id_idx").on(table.userId),
    index("users_login_phone_idx").on(table.phone),
    index("users_login_last_login_idx").on(table.lastLoginAt),
  ],
);

export type BaseTbUserLogin = typeof base_tb_users_login.$inferSelect;
export type NewBaseTbUserLogin = typeof base_tb_users_login.$inferInsert;
