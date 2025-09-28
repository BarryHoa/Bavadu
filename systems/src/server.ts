import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import dotenv from "dotenv";

// Import plugins
import authenticatePlugin from "./plugins/authenticate";
import databasePlugin from "./plugins/database";

// Import route groups
import { registerRouteGroups } from "./routes/groups";

// Load environment variables
dotenv.config();

// Create Fastify instance
const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      removeAdditional: "all",
      coerceTypes: true,
      useDefaults: true,
    },
  },
});

// Register plugins
fastify.register(cors, {
  origin: true,
  credentials: true,
});

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || "your-super-secret-jwt-key-here",
});

// Register authentication plugin
fastify.register(authenticatePlugin);

// Register database plugin
fastify.register(databasePlugin);

// Register route groups
fastify.register(registerRouteGroups);

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || "0.0.0.0";

    await fastify.listen({ port, host });
    console.log(`🚀 Server is running on http://${host}:${port}`);
    console.log(`📊 Health endpoints:`);
    console.log(`   - Health check: http://${host}:${port}/health`);
    console.log(`   - Ping: http://${host}:${port}/ping`);
    console.log(`   - Readiness: http://${host}:${port}/ready`);
    console.log(`   - Liveness: http://${host}:${port}/live`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
