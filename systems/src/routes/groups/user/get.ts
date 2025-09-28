import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// Get user router
async function getUserRouter(fastify: FastifyInstance) {
  // Get user by ID
  fastify.get(
    "/:id",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };

      try {
        // TODO: Implement actual user fetching logic
        // For now, return mock data
        const mockUser = {
          id: parseInt(id),
          username: `user${id}`,
          email: `user${id}@example.com`,
          createdAt: new Date().toISOString(),
        };

        return {
          success: true,
          data: { user: mockUser },
        };
      } catch (error) {
        console.error("Get user error:", error);
        reply.code(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    }
  );
}

export { getUserRouter };
