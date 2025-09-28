import { FastifyInstance } from "fastify";
import { authGroup } from "./auth";
import { userGroup } from "./user";
import { healthGroup } from "./health";

// Register all route groups
export async function registerRouteGroups(fastify: FastifyInstance) {
  const prefix = "/api";
  // Register auth group
  await fastify.register(authGroup, { prefix: `${prefix}/auth` });

  // Register user group
  await fastify.register(userGroup, { prefix: `${prefix}/users` });

  // Register health group (no prefix for root level)
  // await fastify.register(healthGroup);
}
