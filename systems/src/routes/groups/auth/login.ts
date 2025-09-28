import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// Login router
async function loginRouter(fastify: FastifyInstance) {
  // Login endpoint
  fastify.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };

      try {
        // TODO: Implement actual login logic
        // For now, return a mock response
        const token = fastify.jwt.sign({ email, userId: "mock-user-id" });

        return {
          success: true,
          message: "Login successful",
          data: {
            token,
            user: {
              email,
              id: "mock-user-id",
            },
          },
        };
      } catch (error) {
        console.error("Login error:", error);
        reply.code(500).send({
          success: false,
          message: "Internal server error",
        });
        return;
      }
    }
  );
}

export { loginRouter };
