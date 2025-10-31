import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schemas/index.ts",
  out: "./server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=${process.env.PGSSLMODE || "disable"}`,
  },
  verbose: true,
  strict: true,
});
