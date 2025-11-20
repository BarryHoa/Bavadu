import { NextRequest, NextResponse } from "next/server";
import { rateLimitStore } from "../utils/rate-limit-store";

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  // Authentication endpoints - stricter limits
  auth: {
    max: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // General API endpoints
  api: {
    max: 100,
    windowMs: 60 * 1000, // 1 minute
  },
};

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
  return "unknown";
}

/**
 * Check rate limit for API request
 * Returns error response if rate limit exceeded, null otherwise
 */
export function checkRateLimit(
  request: NextRequest,
  pathname: string
): NextResponse | null {
  const ip = getClientIp(request);
  const isAuthRoute = pathname.startsWith("/api/base/auth/");
  const config = isAuthRoute ? RATE_LIMIT_CONFIG.auth : RATE_LIMIT_CONFIG.api;

  const key = `rate-limit:${ip}`;
  const count = rateLimitStore.increment(key, config.windowMs);

  if (count > config.max) {
    const resetTime = Math.ceil(
      (rateLimitStore.getTimeUntilReset(key) + Date.now()) / 1000
    );
    const retryAfter = Math.ceil(
      rateLimitStore.getTimeUntilReset(key) / 1000
    );

    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded",
        message: "Too many requests, please try again later",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(config.max),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(resetTime),
          "Retry-After": String(retryAfter),
        },
      }
    );
  }

  return null;
}

