/**
 * Rate Limiting Configuration
 */

export type RateLimitConfig = {
  /**
   * Authentication endpoints - stricter limits
   */
  auth: {
    /**
     * Maximum number of requests
     */
    max: number;
    /**
     * Time window in milliseconds
     */
    windowMs: number;
  };
  /**
   * General API endpoints
   */
  api: {
    /**
     * Maximum number of requests
     */
    max: number;
    /**
     * Time window in milliseconds
     */
    windowMs: number;
  };
};

export const RATE_LIMIT_CONFIG = {
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
} as const satisfies RateLimitConfig;
