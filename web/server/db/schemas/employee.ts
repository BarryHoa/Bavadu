import {
  date,
  decimal,
  integer,
  json,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// Single employees table with work-related fields only
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Reference to users table
  status: varchar("status", { length: 20 }).notNull().default("active"),
  joinDate: date("join_date").notNull(),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  dateOfBirth: date("date_of_birth"),
  emergencyName: varchar("emergency_name", { length: 100 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),

  // Work-related multi-value fields as JSON arrays
  positions: json("positions").$type<
    Array<{
      position: string;
      department: string;
      startDate: string;
      endDate?: string;
      isCurrent: boolean;
    }>
  >(),
  roles: json("roles").$type<string[]>(),
  addresses:
    json("addresses").$type<
      Array<{ address: string; type: string; isPrimary: boolean }>
    >(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Types
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
