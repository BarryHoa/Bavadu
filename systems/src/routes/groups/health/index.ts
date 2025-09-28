import { FastifyInstance } from "fastify";
import { healthRouter } from "./health";
import { pingRouter } from "./ping";
import { readyRouter } from "./ready";
import { liveRouter } from "./live";
import {
  loggingMiddleware,
  securityHeadersMiddleware,
  responseTimeLoggingMiddleware,
} from "@/middleware";

// Health group routes
export async function healthGroup(fastify: FastifyInstance) {
  // Apply middleware to all health routes
  fastify.addHook("preHandler", loggingMiddleware);
  fastify.addHook("onSend", securityHeadersMiddleware);
  fastify.addHook("onSend", responseTimeLoggingMiddleware);

  // Register individual health routers
  fastify.register(healthRouter);
  fastify.register(pingRouter);
  fastify.register(readyRouter);
  fastify.register(liveRouter);
}
