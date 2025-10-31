import { boolean, integer, pgTable, serial, timestamp, uuid, varchar } from "drizzle-orm/pg-core";



export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(), // UUID v7
  avatar: varchar("avatar", { length: 512 }),
  gender: varchar("gender", { length: 10 }), // 'male', 'female', 'other'
  dateOfBirth: timestamp("date_of_birth"),
  bio: varchar("bio", { length: 120 }),
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  phones: varchar("phones", { length: 20 }).array(),
  addresses: varchar("addresses", { length: 225 }).array(),
  emails: varchar("emails", { length: 255 }).array(),
  status: varchar("status", { length: 20 }).default('active').notNull(), // 'active', 'inactive', 'block'
  isVerified: boolean("is_verified").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersLogin= pgTable("users_login", {
  userId: uuid("user_id").notNull().references(() => users.id),
  username: varchar("username", { length: 50 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  lastLoginIp: varchar("last_login_ip", { length: 45 }),
  lastLoginUserAgent: varchar("last_login_user_agent", { length: 255 }),
  lastLoginLocation: varchar("last_login_location", { length: 255 }),
  lastLoginDevice: varchar("last_login_device", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export type User = typeof users.$inferSelect;
export type UsersLogin = typeof usersLogin.$inferSelect;

