/**
 * Custom Next.js 16 Server with Fastify
 * Latest example for Next.js 16 + Fastify integration
 * Loads all models at server startup before handling requests
 */

import { RuntimeContext } from "@base/server/runtime/RuntimeContext";
import http from "http";
import next from "next";
import { ScheduledTask } from "./cron";

// Mark that we're running custom server to skip instrumentation
process.env.RUNNING_CUSTOM_SERVER = "true";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Create Next.js app
const app = next({
  dev,
  hostname,
  port,
  dir: process.cwd(),
});

const handle = app.getRequestHandler();

async function startServer(): Promise<void> {
  try {
    await app.prepare();

    // Initialize runtime using RuntimeContext
    // This handles database and environment initialization
    console.log("> 🔧 Initializing runtime...");
    const context = RuntimeContext.getInstance(process.cwd());
    await context.ensureInitialized();
    console.log("> ✅ Runtime initialized");

    // Get instances from context
    const connectionPool = context.getConnectionPool();
    const modelInstance = context.getModelInstance();

    // Calculate and log modelInstance size in KB
    try {
      const seen = new Set();
      const envProcessJson = JSON.stringify(modelInstance, (key, value) => {
        // Skip functions
        if (typeof value === "function") {
          return "[Function]";
        }
        // Handle circular references
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular]";
          }
          seen.add(value);
        }
        return value;
      });
      const sizeInBytes = Buffer.byteLength(envProcessJson, "utf8");
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      console.log(
        `> 📊 Environment size: ${sizeInKB} KB (${sizeInBytes} bytes)`
      );
    } catch (error) {
      console.log(`> ⚠️  Could not calculate environment size:`, error);
    }

    // Initialize and start cron scheduler
    const scheduler = new ScheduledTask();
    scheduler.start();

    const server = http.createServer(async (req, res) => {
      await handle(req, res);
    });

    // Graceful shutdown
    const closeServer = () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });

    const gracefulShutdown = async (signal: string) => {
      console.log(`ℹ️  Received ${signal}, shutting down...`);
      try {
        // Stop cron scheduler
        if (scheduler) {
          scheduler.stop();
        }
        await closeServer();
        await connectionPool.closeAll();
        await app.close();
        console.log("✅ Server closed gracefully");
        process.exit(0);
      } catch (error) {
        console.error("❌ Error during shutdown:", error);
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    server.listen(port, hostname === "localhost" ? "0.0.0.0" : hostname, () => {
      const serverUrl = `http://${hostname}:${port}`;
      console.log(`> 🚀 Server ready on ${serverUrl}`);
      console.log(`> 📦 Environment: ${dev ? "development" : "production"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
