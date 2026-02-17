import { defineConfig } from "drizzle-kit";

const sslMode = process.env.PGSSLMODE || "disable";
const channelBinding = process.env.PGCHANNELBINDING || "";
const port = process.env.PGPORT || "5432";

const pgUser = process.env.PGUSER;
const pgHost = process.env.PGHOST;
const pgDb = process.env.PGDATABASE;

const dbUrl = `postgres://${pgUser}:${process.env.PGPASSWORD}@${pgHost}:${port}/${pgDb}?sslmode=${sslMode}${
  channelBinding ? `&channel_binding=${channelBinding}` : ""
}`;

// Log thông tin kết nối (ẩn mật khẩu) khi chạy drizzle-kit migrate
// Giúp kiểm tra db:migrate đang chạy vào DB nào
// eslint-disable-next-line no-console
console.log(
  "[drizzle.config] db:migrate target:",
  JSON.stringify(
    {
      host: pgHost,
      port,
      user: pgUser,
      database: pgDb,
      sslMode,
    },
    null,
    2,
  ),
);

export default defineConfig({
  schema: "./server/db/schemas/index.ts",
  out: "./server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true,
  strict: true,
});

