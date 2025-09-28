import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// Ready router
async function readyRouter(fastify: FastifyInstance) {
  // Readiness check (for Kubernetes/Docker)
  fastify.get(
    "/ready",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Check if database is ready - simplified for now
        // TODO: Add proper database check when database is configured
        reply.code(200);
        return {
          status: "ready",
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        reply.code(503);
        return {
          status: "not ready",
          error:
            error instanceof Error ? error.message : "Database not available",
          timestamp: new Date().toISOString(),
        };
      }
    }
  );
}

export { readyRouter };
