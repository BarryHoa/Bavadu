import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// Create user router
async function createUserRouter(fastify: FastifyInstance) {
  // Create user
  fastify.post(
    "/",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "email"],
          properties: {
            username: { type: "string", minLength: 3, maxLength: 50 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { username, email, password } = request.body as {
        username: string;
        email: string;
        password?: string;
      };

      try {
        // TODO: Implement actual user creation logic
        // For now, return mock data
        const newUser = {
          id: Date.now(),
          username,
          email,
          createdAt: new Date().toISOString(),
        };

        reply.code(201);
        return {
          success: true,
          message: "User created successfully",
          data: { user: newUser },
        };
      } catch (error) {
        console.error("Create user error:", error);
        reply.code(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    }
  );
}

export { createUserRouter };
