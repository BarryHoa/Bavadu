/**
 * Custom Next.js 16 Server with Fastify
 * Latest example for Next.js 16 + Fastify integration
 * Loads all models at server startup before handling requests
 */

import getEnv from "@base/server/env";
import http from "http";
import next from "next";

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

async function loadAllModels(): Promise<void> {
  await getEnv().init();
  console.log("✅ All models loaded successfully");
}

async function startServer(): Promise<void> {
  try {
    await app.prepare();
    console.log("✅ Next.js app prepared");

    await loadAllModels();

    const server = http.createServer(async (req, res) => {
      try {
        // Optional health check
        if (req.url === "/health") {
          res.statusCode = 200;
          res.setHeader("content-type", "application/json");
          res.end(
            JSON.stringify({ status: "ok", ts: new Date().toISOString() })
          );
          return;
        }

        await handle(req, res);
      } catch (err) {
        console.error("❌ Request handling error:", err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end("Internal Server Error");
        }
      }
    });

    // Graceful shutdown
    const closeServer = () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });

    const gracefulShutdown = async (signal: string) => {
      console.log(`ℹ️  Received ${signal}, shutting down...`);
      try {
        await closeServer();
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
