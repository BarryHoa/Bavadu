import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

async function registerRouter(fastify: FastifyInstance) {
  // Register endpoint
  fastify.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "email", "password"],
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
        password: string;
      };

      try {
        // TODO: Implement actual registration logic
        // For now, return a mock response
        return {
          success: true,
          message: "Registration successful",
          data: {
            user: {
              username,
              email,
              id: "mock-user-id",
            },
          },
        };
      } catch (error) {
        console.error("Registration error:", error);
        reply.code(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    }
  );
}

export { registerRouter };
