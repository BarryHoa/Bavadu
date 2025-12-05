import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { DatabaseConnection } from "../stores/database";
import type { SystemRuntimeVariables } from "../types/global";

const getDbConnect = (key: string = "primary"): PostgresJsDatabase<Record<string, never>> => {
  const systemRuntimeVariables = globalThis.systemRuntimeVariables;
  if (!systemRuntimeVariables?.database) {
    throw new Error(
      "Database not initialized. Call Database.initialize() first."
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
