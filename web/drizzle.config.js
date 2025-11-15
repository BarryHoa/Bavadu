import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schemas/index.ts",
  out: "./server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: (() => {
      const sslMode = process.env.PGSSLMODE || "disable";
      const channelBinding = process.env.PGCHANNELBINDING || "";
      const port = process.env.PGPORT || "5432";
      return `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}?sslmode=${sslMode}${channelBinding ? `&channel_binding=${channelBinding}` : ""}`;
    })(),
  },
  verbose: true,
  strict: true,
});
