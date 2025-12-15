/**
 * Next.js Instrumentation Hook
 * This file runs once when the server starts (in serverless environments, this runs per function instance)
 * Used to initialize database and environment for Vercel/serverless deployments
 */

// Log immediately when file is loaded (before register is called)
console.log("> 📦 instrumentation.ts file loaded");

export async function register() {
  // Log environment variables for debugging
  console.log("> 🔍 Instrumentation hook called (register function)");
  console.log("> 🔍 NEXT_RUNTIME:", process.env.NEXT_RUNTIME);
  console.log("> 🔍 VERCEL:", process.env.VERCEL);
  console.log("> 🔍 NODE_ENV:", process.env.NODE_ENV);
  console.log("> 🔍 RUNNING_CUSTOM_SERVER:", process.env.RUNNING_CUSTOM_SERVER);
  console.log("> 🔍 FORCE_INSTRUMENTATION:", process.env.FORCE_INSTRUMENTATION);

  // Only run for Node.js runtime
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    console.log("> ⏭️  Skipping instrumentation (not Node.js runtime)");
    return;
  }

  // Skip instrumentation if running custom server (server.ts)
  // The custom server handles initialization itself
  if (process.env.RUNNING_CUSTOM_SERVER === "true") {
    console.log("> ⏭️  Skipping instrumentation (custom server detected)");
    return;
  }

  // Determine if we should run instrumentation
  // Run if:
  // 1. VERCEL env is set (Vercel production/preview)
  // 2. NODE_ENV is production (production builds)
  // 3. FORCE_INSTRUMENTATION is set (explicit override)
  const shouldRun =
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production" ||
    process.env.FORCE_INSTRUMENTATION === "true";

  if (!shouldRun) {
    console.log(
      "> ⏭️  Skipping instrumentation (not in serverless/production environment)"
    );
    return;
  }

  try {
    // Initialize in serverless environments (Vercel, etc.)
    // This runs when the serverless function starts
    console.log("> 🔧 Initializing server runtime...");

    // Use shared initialization utility
    const { initializeRuntime } =
      await import("@base/server/utils/initializeRuntime");
    await initializeRuntime();

    console.log("> 🔧 Runtime initialization completed");

    console.log("> ✅ Runtime initialized (database, environment)");

    // Initialize and start cron scheduler (only if not in serverless)
    // Note: Cron jobs may not work in serverless environments
    if (!process.env.VERCEL) {
      const { ScheduledTask } = await import("./cron");
      const scheduler = new ScheduledTask();
      scheduler.start();
      console.log("> ⏰ Cron scheduler started");
    } else {
      console.log("> ⚠️  Cron scheduler skipped (serverless environment)");
    }

    console.log("> ✅ Server runtime initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize server runtime:", error);
    console.error(
      "❌ Error stack:",
      error instanceof Error ? error.stack : "No stack"
    );
    // Re-throw the error to prevent the app from starting with uninitialized database
    // This ensures we catch initialization issues early
    throw error;
  }
}
