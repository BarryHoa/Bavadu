import { FastifyRequest, FastifyReply } from "fastify";

// Rate limiting middleware (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export async function rateLimitMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const ip = request.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // 100 requests per window

  const current = requestCounts.get(ip);

  if (!current || now > current.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    current.count++;
    if (current.count > maxRequests) {
      reply.code(429).send({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
      });
      return;
    }
  }
}
