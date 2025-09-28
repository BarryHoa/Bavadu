import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// Live router
async function liveRouter(fastify: FastifyInstance) {
  // Liveness check (for Kubernetes/Docker)
  fastify.get("/live", async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  });
}

export { liveRouter };
