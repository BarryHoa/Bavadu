import usersModel from "@/Models/UsersModel";
import UsersModel from "@/Models/UsersModel";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// List users router
async function listUsersRouter(fastify: FastifyInstance) {
  // Get all users
  fastify.get(
    "/",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            limit: { type: "number", minimum: 1, maximum: 100, default: 10 },
            search: { type: "string" },
            filters: { type: "object" },
            sorts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  direction: { type: "string", enum: ["asc", "desc"] },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // TODO: Implement actual user fetching logic with database
        // For now, return mock data

        const users = await usersModel.getUsers(request.query as any);

        return {
          success: true,
          data: {
            users: users,
            pagination: {
              page: request.query.page,
              limit: request.query.limit,
              total: users.length,
              pages: Math.ceil(users.length / request.query.limit),
            },
          },
        };
      } catch (error) {
        console.error("Get users error:", error);
        reply.code(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    }
  );
}

export { listUsersRouter };
