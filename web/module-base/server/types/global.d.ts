import type { Database } from "../stores/database";
import type Environment from "../env";

/**
 * Global runtime variables available throughout the application
 * Set during server initialization in server.ts
 */
declare global {
  // eslint-disable-next-line no-var
  var systemRuntimeVariables: SystemRuntimeVariables | undefined;
}

export interface SystemRuntimeVariables {
  /** Database instance for managing connections */
  database: Database;
  /** Environment instance containing models, menus, etc. */
  env: Environment;
  /** Current server timestamp in format "YYYY-MM-DD HH:mm:ss" */
  timestamp: string;
}

export {};

