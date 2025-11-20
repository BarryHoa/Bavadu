import { NextRequest, NextResponse } from "next/server";
import { rateLimitStore } from "../utils/rate-limit-store";

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  max: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  /**
   * Custom key generator function
   * Default: uses IP address
   */
  keyGenerator?: (request: NextRequest) => string;
  /**
   * Custom message when rate limit is exceeded
   */
  message?: string;
  /**
   * Whether to include rate limit headers in response
   * @default true
   */
  standardHeaders?: boolean;
  /**
   * Whether to include legacy rate limit headers
   * @default false
   */
  legacyHeaders?: boolean;
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return request.ip || "unknown";
}

/**
 * Default key generator using IP address
 */
function defaultKeyGenerator(request: NextRequest): string {
  return `rate-limit:${getClientIp(request)}`;
}

/**
 * Create rate limit key with optional prefix
 */
function createRateLimitKey(
  request: NextRequest,
  prefix: string,
  keyGenerator?: (request: NextRequest) => string
): string {
  const baseKey = keyGenerator
    ? keyGenerator(request)
    : defaultKeyGenerator(request);
  return `${prefix}:${baseKey}`;
}

/**
 * Rate limit middleware
 * Returns middleware function that enforces rate limits
 */
export function withRateLimit(
  config: RateLimitConfig
): (request: NextRequest) => Promise<NextResponse | null> {
  const {
    max,
    windowMs,
    keyGenerator,
    message = "Too many requests, please try again later",
    standardHeaders = true,
    legacyHeaders = false,
  } = config;

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = keyGenerator ? keyGenerator(request) : defaultKeyGenerator(request);
    const count = rateLimitStore.increment(key, windowMs);

    // Create response headers
    const headers = new Headers();

    if (standardHeaders) {
      headers.set("X-RateLimit-Limit", String(max));
      headers.set("X-RateLimit-Remaining", String(Math.max(0, max - count)));
      headers.set(
        "X-RateLimit-Reset",
        String(
          Math.ceil((rateLimitStore.getTimeUntilReset(key) + Date.now()) / 1000)
        )
      );
    }

    if (legacyHeaders) {
      headers.set("X-RateLimit-Limit", String(max));
      headers.set("X-RateLimit-Remaining", String(Math.max(0, max - count)));
    }

    // Check if rate limit exceeded
    if (count > max) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          message,
          retryAfter: Math.ceil(rateLimitStore.getTimeUntilReset(key) / 1000),
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Return null to continue (rate limit not exceeded)
    // The middleware will add headers to the response
    return null;
  };
}

/**
 * Rate limit middleware with user-based limiting (after authentication)
 * Requires user to be authenticated
 */
export function withUserRateLimit(
  config: RateLimitConfig & {
    userId: string;
  }
): (request: NextRequest) => Promise<NextResponse | null> {
  const {
    max,
    windowMs,
    userId,
    message = "Too many requests, please try again later",
    standardHeaders = true,
    legacyHeaders = false,
  } = config;

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = `user:${userId}`;
    const count = rateLimitStore.increment(key, windowMs);

    const headers = new Headers();

    if (standardHeaders) {
      headers.set("X-RateLimit-Limit", String(max));
      headers.set("X-RateLimit-Remaining", String(Math.max(0, max - count)));
      headers.set(
        "X-RateLimit-Reset",
        String(
          Math.ceil((rateLimitStore.getTimeUntilReset(key) + Date.now()) / 1000)
        )
      );
    }

    if (legacyHeaders) {
      headers.set("X-RateLimit-Limit", String(max));
      headers.set("X-RateLimit-Remaining", String(Math.max(0, max - count)));
    }

    if (count > max) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          message,
          retryAfter: Math.ceil(rateLimitStore.getTimeUntilReset(key) / 1000),
        },
        {
          status: 429,
          headers,
        }
      );
    }

    return null;
  };
}

/**
 * Apply rate limiting to a route handler
 */
export function applyRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig
): (request: NextRequest) => Promise<NextResponse> {
  const rateLimitMiddleware = withRateLimit(config);

  return async (request: NextRequest): Promise<NextResponse> => {
    // Check rate limit
    const rateLimitResponse = await rateLimitMiddleware(request);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Execute handler
    const response = await handler(request);

    // Add rate limit headers to response
    const key = config.keyGenerator
      ? config.keyGenerator(request)
      : defaultKeyGenerator(request);
    const count = rateLimitStore.get(key);
    const remaining = Math.max(0, config.max - count);
    const resetTime = Math.ceil(
      (rateLimitStore.getTimeUntilReset(key) + Date.now()) / 1000
    );

    if (config.standardHeaders) {
      response.headers.set("X-RateLimit-Limit", String(config.max));
      response.headers.set("X-RateLimit-Remaining", String(remaining));
      response.headers.set("X-RateLimit-Reset", String(resetTime));
    }

    return response;
  };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  /**
   * Strict rate limit: 10 requests per minute
   */
  STRICT: {
    max: 10,
    windowMs: 60 * 1000,
  },
  /**
   * Standard rate limit: 100 requests per 15 minutes
   */
  STANDARD: {
    max: 100,
    windowMs: 15 * 60 * 1000,
  },
  /**
   * Lenient rate limit: 1000 requests per hour
   */
  LENIENT: {
    max: 1000,
    windowMs: 60 * 60 * 1000,
  },
  /**
   * Authentication endpoints: 5 requests per 15 minutes
   */
  AUTH: {
    max: 5,
    windowMs: 15 * 60 * 1000,
  },
  /**
   * API endpoints: 200 requests per 15 minutes
   */
  API: {
    max: 200,
    windowMs: 15 * 60 * 1000,
  },
};

