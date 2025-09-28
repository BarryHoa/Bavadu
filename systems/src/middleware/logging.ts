import { FastifyRequest, FastifyReply } from "fastify";

// Logging middleware
export async function loggingMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const start = Date.now();

  request.log.info(
    {
      method: request.method,
      url: request.url,
      // ip: request.ip,
      // userAgent: request.headers["user-agent"],
    },
    "Incoming request"
  );

  // Store start time in request for later use
  (request as any).startTime = start;
}

// Response time logging middleware
export async function responseTimeLoggingMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const startTime = (request as any).startTime;
  if (startTime) {
    const duration = Date.now() - startTime;
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration: `${duration}ms`,
      },
      "Request completed"
    );
  }
}
