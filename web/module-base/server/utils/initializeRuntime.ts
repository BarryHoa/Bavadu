/**
 * Utility function to initialize runtime (database, environment) for serverless environments
 * This is used by API routes and cron jobs to ensure proper initialization
 *
 * This function delegates to RuntimeContext which provides:
 * - Thread-safe initialization (Promise-based lock)
 * - Idempotent initialization (safe to call multiple times)
 */

import { RuntimeContext } from "../runtime/RuntimeContext";

/**
 * Initialize runtime if not already initialized
 * This ensures database and environment are ready for use
 * Thread-safe: concurrent calls will wait for the same initialization promise
 *
 * @param projectRoot - Optional project root path (defaults to process.cwd())
 */
export async function initializeRuntime(projectRoot?: string): Promise<void> {
  console.log("[initializeRuntime] Starting initialization...");
  const context = RuntimeContext.getInstance(projectRoot);
  console.log("[initializeRuntime] Current state:", {
    initialized: context.getInitializationState(),
    hasState: !!context.getState(),
  });

  try {
    // Delegate to RuntimeContext for thread-safe initialization
    await context.ensureInitialized();

    console.log("[initializeRuntime] Initialization completed successfully");
    console.log("[initializeRuntime] Final state:", {
      initialized: context.getInitializationState(),
      hasState: !!context.getState(),
    });
  } catch (error) {
    console.error("[initializeRuntime] Error during initialization:", error);
    console.error(
      "[initializeRuntime] Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    throw error;
  }
}
