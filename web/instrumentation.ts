/**
 * Next.js Instrumentation Hook
 * This file runs once when the server starts (in serverless environments, this runs per function instance)
 * Used to initialize database and environment for Vercel/serverless deployments
 */

import type { SystemRuntimeVariables } from "@base/server/types/global";

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
    if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
      console.log(
        "> ⏭️  Skipping instrumentation (local development with custom server)"
      );
      return;
    }

    try {
      // Initialize in serverless environments (Vercel, etc.)
      // This runs when the serverless function starts
      const { Database } = await import("@base/server/stores/database");
      const Environment = (await import("@base/server/env")).default;
      const { getLogModel } = await import("@base/server/models/Logs/LogModel");
      const dayjs = (await import("dayjs")).default;
      const { ScheduledTask } = await import("./cron");

      console.log("> 🔧 Initializing server runtime...");

      // Initialize logging system FIRST
      getLogModel();
      console.log("> 📝 Logging system initialized");

      // Initialize database
      const database = new Database(process.cwd());
      await database.initialize();
      console.log("> 🗄️  Database initialized");

      // Set database to globalThis BEFORE initializing environment
      // Initialize with database first, then add env later
      globalThis.systemRuntimeVariables = {
        database: database,
      } as SystemRuntimeVariables;

      // Initialize environment
      const envProcess = await Environment.create();
      console.log("> ⚙️  Environment initialized");

      // Set globalThis with env, database, and initial timestamp
      globalThis.systemRuntimeVariables = {
        env: envProcess,
        database: database,
        timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      };

      // Initialize and start cron scheduler (only if not in serverless)
      // Note: Cron jobs may not work in serverless environments
      if (!process.env.VERCEL) {
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
