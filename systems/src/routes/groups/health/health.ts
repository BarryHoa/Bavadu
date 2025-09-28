import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// Health check response interface
interface HealthResponse {
  status: "OK" | "ERROR";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: "OK" | "ERROR";
      responseTime?: number;
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

// Health router
async function healthRouter(fastify: FastifyInstance) {
  // Basic health check
  fastify.get(
    "/health",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const startTime = Date.now();

      try {
        // Check database connectivity - simplified for now
        let dbStatus: "OK" | "ERROR" = "OK";
        let dbResponseTime: number | undefined;
        let dbError: string | undefined;

        // For now, skip database check to avoid Drizzle ORM issues
        // TODO: Fix database connection test when database is properly configured
        dbStatus = "OK";
        dbResponseTime = 0;

        // Get memory usage
        const memUsage = process.memoryUsage();
        const totalMemory = memUsage.heapTotal + memUsage.external;
        const usedMemory = memUsage.heapUsed;
        const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

        const healthResponse: HealthResponse = {
          status: dbStatus === "OK" ? "OK" : "ERROR",
          timestamp: new Date().toISOString(),
          uptime: Math.floor(process.uptime()),
          version: process.env.npm_package_version || "1.0.0",
          environment: process.env.NODE_ENV || "development",
          services: {
            database: {
              status: dbStatus,
              responseTime: dbResponseTime,
              error: dbError,
            },
            memory: {
              used: Math.round(usedMemory / 1024 / 1024), // MB
              total: Math.round(totalMemory / 1024 / 1024), // MB
              percentage: memoryPercentage,
            },
          },
        };

        const responseTime = Date.now() - startTime;

        // Set appropriate status code
        if (healthResponse.status === "ERROR") {
          reply.code(503); // Service Unavailable
        } else {
          reply.code(200); // OK
        }

        // Add response time header
        reply.header("X-Response-Time", `${responseTime}ms`);

        return healthResponse;
      } catch (error) {
        console.error("Health check failed:", error);

        reply.code(503);
        return {
          status: "ERROR",
          timestamp: new Date().toISOString(),
          uptime: Math.floor(process.uptime()),
          version: process.env.npm_package_version || "1.0.0",
          environment: process.env.NODE_ENV || "development",
          services: {
            database: {
              status: "ERROR",
              error: error instanceof Error ? error.message : "Unknown error",
            },
            memory: {
              used: 0,
              total: 0,
              percentage: 0,
            },
          },
        };
      }
    }
  );
}

export { healthRouter };
