import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { DatabaseConnection } from "../stores/database";

const getDbConnect = (
  key: string = "primary"
): PostgresJsDatabase<Record<string, never>> => {
  const systemRuntimeVariables = globalThis.systemRuntimeVariables;
  if (!systemRuntimeVariables?.database) {
    console.error("[getDbConnect] Database not initialized!");
    console.error("[getDbConnect] Environment:", {
      NEXT_RUNTIME: process.env.NEXT_RUNTIME,
      VERCEL: process.env.VERCEL,
      NODE_ENV: process.env.NODE_ENV,
      RUNNING_CUSTOM_SERVER: process.env.RUNNING_CUSTOM_SERVER,
    });
    console.error("[getDbConnect] globalThis.systemRuntimeVariables:", {
      exists: !!globalThis.systemRuntimeVariables,
      hasDatabase: !!globalThis.systemRuntimeVariables?.database,
      hasEnv: !!globalThis.systemRuntimeVariables?.env,
    });
    throw new Error(
      "Database not initialized. Call Database.initialize() first. " +
        "This usually means instrumentation.ts did not run or failed. " +
        `Check logs for initialization errors. Environment: VERCEL=${process.env.VERCEL}, NODE_ENV=${process.env.NODE_ENV}`
    );
  }
  const connection = systemRuntimeVariables.database.getConnection(
    key
  ) as DatabaseConnection;
  if (!connection) {
    throw new Error(`Database connection "${key}" not found.`);
  }
  if (!connection.db) {
    throw new Error(`Database connection "${key}" not initialized.`);
  }
  const type = connection.type;
  switch (type) {
    case "postgres":
      return connection?.db as PostgresJsDatabase<Record<string, never>>;
    default:
      throw new Error(
        `Database connection "${key}" is not a PostgreSQL connection.`
      );
  }
};

export default getDbConnect;
