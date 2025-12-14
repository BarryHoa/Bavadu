/**
 * Next.js Instrumentation Hook
 * This file runs once when the server starts (in serverless environments, this runs per function instance)
 * Used to initialize database and environment for Vercel/serverless deployments
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Skip instrumentation if running custom server (server.ts)
    // The custom server handles initialization itself
    if (process.env.RUNNING_CUSTOM_SERVER === "true") {
      console.log("> ⏭️  Skipping instrumentation (custom server detected)");
      return;
    }

    // Only run instrumentation in serverless environments (Vercel, etc.)
    // Skip in local development when using custom server
    // If VERCEL env is not set and not in production, assume custom server will handle it
    // But allow explicit VERCEL=1 to force instrumentation even in development
    if (
      !process.env.VERCEL &&
      process.env.NODE_ENV !== "production" &&
      !process.env.FORCE_INSTRUMENTATION
    ) {
      console.log(
        "> ⏭️  Skipping instrumentation (local development with custom server)"
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
      // Don't throw - allow app to continue without initialization
      // Individual API routes will handle their own database connections if needed
    }
  }
}
