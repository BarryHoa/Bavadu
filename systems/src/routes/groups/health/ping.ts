import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// Ping router
async function pingRouter(fastify: FastifyInstance) {
  // Simple ping endpoint
  fastify.get("/ping", async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      message: "pong",
      timestamp: new Date().toISOString(),
    };
  });
}

export { pingRouter };
