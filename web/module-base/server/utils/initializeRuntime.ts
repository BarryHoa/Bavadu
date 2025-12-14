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
  console.log("[initializeRuntime] Starting initialization...");
  console.log("[initializeRuntime] Current state:", {
    hasSystemRuntime: !!globalThis.systemRuntimeVariables,
    hasDatabase: !!globalThis.systemRuntimeVariables?.database,
    hasEnv: !!globalThis.systemRuntimeVariables?.env,
  });

  // Check if already initialized
  if (
    globalThis.systemRuntimeVariables?.database &&
    globalThis.systemRuntimeVariables?.env
  ) {
    console.log("[initializeRuntime] Already initialized, skipping");
    return;
  }

  try {
    const { Database } = await import("../stores/database");
    const Environment = (await import("../env")).default;
    const { getLogModel } = await import("../models/Logs/LogModel");
    const dayjs = (await import("dayjs")).default;

    console.log("[initializeRuntime] Imports loaded");

    // Initialize logging system FIRST
    getLogModel();
    console.log("[initializeRuntime] Logging system initialized");

    // Initialize database
    console.log("[initializeRuntime] Creating database instance...");
    const database = new Database(process.cwd());
    console.log("[initializeRuntime] Database instance created, initializing...");
    await database.initialize();
    console.log("[initializeRuntime] Database initialized successfully");

    // Set database to globalThis BEFORE initializing environment
    // because models need database during initialization
    if (!globalThis.systemRuntimeVariables) {
      globalThis.systemRuntimeVariables = {} as SystemRuntimeVariables;
    }
    globalThis.systemRuntimeVariables.database = database;
    console.log("[initializeRuntime] Database set to globalThis");

    // Initialize environment (needed for models)
    console.log("[initializeRuntime] Creating environment...");
    const envProcess = await Environment.create();
    console.log("[initializeRuntime] Environment created");

    // Set globalThis with env, database, and initial timestamp
    globalThis.systemRuntimeVariables = {
      env: envProcess,
      database: database,
      timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };
    console.log("[initializeRuntime] Final state:", {
      hasSystemRuntime: !!globalThis.systemRuntimeVariables,
      hasDatabase: !!globalThis.systemRuntimeVariables?.database,
      hasEnv: !!globalThis.systemRuntimeVariables?.env,
    });
    console.log("[initializeRuntime] Initialization completed successfully");
  } catch (error) {
    console.error("[initializeRuntime] Error during initialization:", error);
    console.error("[initializeRuntime] Error stack:", error instanceof Error ? error.stack : "No stack");
    throw error;
  }
}
