import { FastifyRequest, FastifyReply } from "fastify";

// Request validation middleware
export async function validateRequestMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Basic request validation
  if (
    request.method === "POST" ||
    request.method === "PUT" ||
    request.method === "PATCH"
  ) {
    if (!request.headers["content-type"]?.includes("application/json")) {
      reply.code(400).send({
        error: "Bad Request",
        message: "Content-Type must be application/json",
      });
      return;
    }
  }
}
