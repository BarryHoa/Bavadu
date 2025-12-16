import { RATE_LIMIT_CONFIG } from "@base/server/config";
import { rateLimitStore } from "@base/server/stores";
import {
  getClientIp,
  logRateLimitViolation,
} from "@base/server/utils/security-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * Check rate limit for request
 * Returns error response if rate limit exceeded, null otherwise
 */
export function checkRateLimit(
  request: NextRequest,
  pathname: string,
): NextResponse | null {
  const ip = getClientIp(request);
  const isAuthRoute = pathname.startsWith("/api/base/auth/");
  const config = isAuthRoute ? RATE_LIMIT_CONFIG.auth : RATE_LIMIT_CONFIG.api;

  const key = `rate-limit:${ip}`;
  const count = rateLimitStore.increment(key, config.windowMs);

  if (count > config.max) {
    const resetTime = Math.ceil(
      (rateLimitStore.getTimeUntilReset(key) + Date.now()) / 1000,
    );
    const retryAfter = Math.ceil(rateLimitStore.getTimeUntilReset(key) / 1000);

    // Log rate limit violation
    logRateLimitViolation({
      ip,
      userAgent: request.headers.get("user-agent") || "unknown",
      path: pathname,
      method: request.method,
      limit: config.max,
      window: config.windowMs,
      count,
    });

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
      },
    );
  }

  return null;
}
