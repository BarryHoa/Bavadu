/**
 * Custom Next.js 16 Server with Fastify
 * Latest example for Next.js 16 + Fastify integration
 * Loads all models at server startup before handling requests
 */

import Environment from "@base/server/env";
import http from "http";
import next from "next";
import dayjs from "dayjs";

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

    const envProcess = await Environment.create();
   

    const server = http.createServer(async (req, res) => {
      // INSERT_YOUR_CODE
      // Make a global variable for runtime at server
      // The value is always "server"
      (globalThis as any).systemRuntimeVariables = {
        env: envProcess,
        timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')  
      }
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
