import { FastifyRequest, FastifyReply } from "fastify";

// Security headers middleware
export async function securityHeadersMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  reply.header("X-Content-Type-Options", "nosniff");
  reply.header("X-Frame-Options", "DENY");
  reply.header("X-XSS-Protection", "1; mode=block");
  reply.header("Referrer-Policy", "strict-origin-when-cross-origin");
}

// CORS middleware (already handled by @fastify/cors plugin)
export async function corsMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // CORS is handled by the plugin, this is just a placeholder
  // for any additional CORS logic if needed
}
