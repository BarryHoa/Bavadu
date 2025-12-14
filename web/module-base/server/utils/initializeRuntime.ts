/**
 * Utility function to initialize runtime (database, environment) for serverless environments
 * This is used by API routes and cron jobs to ensure proper initialization
 */

import type { SystemRuntimeVariables } from "../types/global";

/**
 * Initialize runtime if not already initialized
 * This ensures database and environment are ready for use
 */
export async function initializeRuntime(): Promise<void> {
  // Check if already initialized
  if (
    globalThis.systemRuntimeVariables?.database &&
    globalThis.systemRuntimeVariables?.env
  ) {
    return;
  }

  const { Database } = await import("../stores/database");
  const Environment = (await import("../env")).default;
  const { getLogModel } = await import("../models/Logs/LogModel");
  const dayjs = (await import("dayjs")).default;

  // Initialize logging system FIRST
  getLogModel();

  // Initialize database
  const database = new Database(process.cwd());
  await database.initialize();

  // Set database to globalThis BEFORE initializing environment
  globalThis.systemRuntimeVariables = {
    database: database,
  } as SystemRuntimeVariables;

  // Initialize environment (needed for models)
  const envProcess = await Environment.create();

  // Set globalThis with env, database, and initial timestamp
  globalThis.systemRuntimeVariables = {
    env: envProcess,
    database: database,
    timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  };
}
