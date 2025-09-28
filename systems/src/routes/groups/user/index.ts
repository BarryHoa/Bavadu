import { FastifyInstance } from "fastify";
import { listUsersRouter } from "./list";
import { getUserRouter } from "./get";
import { createUserRouter } from "./create";
import { updateUserRouter } from "./update";
import { deleteUserRouter } from "./delete";
import {
  loggingMiddleware,
  rateLimitMiddleware,
  validateRequestMiddleware,
  securityHeadersMiddleware,
  responseTimeLoggingMiddleware,
} from "@/middleware";

// User group routes
export async function userGroup(fastify: FastifyInstance) {
  // Apply middleware to all user routes
  fastify.addHook("preHandler", loggingMiddleware);
  fastify.addHook("preHandler", rateLimitMiddleware);
  fastify.addHook("preHandler", validateRequestMiddleware);
  fastify.addHook("onSend", securityHeadersMiddleware);
  fastify.addHook("onSend", responseTimeLoggingMiddleware);

  // Register individual user routers
  fastify.register(listUsersRouter);
  fastify.register(getUserRouter);
  fastify.register(createUserRouter);
  fastify.register(updateUserRouter);
  fastify.register(deleteUserRouter);
}
