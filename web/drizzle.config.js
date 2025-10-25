import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    host: process.env.DB_HOST || "postgres",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "bava_user",
    password: process.env.DB_PASSWORD || "bava_password",
    database: process.env.DB_NAME || "bava_db",
  },
});
