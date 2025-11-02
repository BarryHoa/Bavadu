import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schemas";

// Create connection using standard PostgreSQL environment variables
const sslMode = process.env.PGSSLMODE || "disable";
const channelBinding = process.env.PGCHANNELBINDING || "";
const connectionString = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=${sslMode}${channelBinding ? `&channel_binding=${channelBinding}` : ""}`;

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle instance
export const db = drizzle(client, { schema });
