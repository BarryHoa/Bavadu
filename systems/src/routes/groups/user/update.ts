import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// Update user router
async function updateUserRouter(fastify: FastifyInstance) {
  // Update user
  fastify.put(
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
        body: {
          type: "object",
          properties: {
            username: { type: "string", minLength: 3, maxLength: 50 },
            email: { type: "string", format: "email" },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const updateData = request.body as { username?: string; email?: string };

      try {
        // TODO: Implement actual user update logic
        // For now, return mock data
        const updatedUser = {
          id: parseInt(id),
          ...updateData,
          updatedAt: new Date().toISOString(),
        };

        return {
          success: true,
          message: "User updated successfully",
          data: { user: updatedUser },
        };
      } catch (error) {
        console.error("Update user error:", error);
        reply.code(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    }
  );
}

export { updateUserRouter };
