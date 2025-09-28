import { FastifyInstance } from "fastify";
import { loginRouter } from "./login";
import { registerRouter } from "./register";
import { logoutRouter } from "./logout";
import { refreshRouter } from "./refresh";
import {
  loggingMiddleware,
  rateLimitMiddleware,
  validateRequestMiddleware,
  securityHeadersMiddleware,
  responseTimeLoggingMiddleware,
} from "@/middleware";

// Auth group routes
export async function authGroup(fastify: FastifyInstance) {
  // Apply middleware to auth routes
  fastify.addHook("preHandler", loggingMiddleware);
  fastify.addHook("preHandler", rateLimitMiddleware);
  fastify.addHook("preHandler", validateRequestMiddleware);
  fastify.addHook("onSend", securityHeadersMiddleware);
  fastify.addHook("onSend", responseTimeLoggingMiddleware);

  // Register individual auth routers
  fastify.register(loginRouter);
  fastify.register(registerRouter);
  fastify.register(logoutRouter);
  fastify.register(refreshRouter);
}
