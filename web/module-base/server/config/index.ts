/**
 * Centralized configuration for server-side settings
 * All configuration values should be defined here for easy management
 */

// ============================================================================
// RATE LIMITING CONFIGURATION
// ============================================================================
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
} as const;

// ============================================================================
// CSRF TOKEN CONFIGURATION
// ============================================================================
export const CSRF_CONFIG = {
  /**
   * Secret key for token generation
   * @default process.env.CSRF_SECRET || 'csrf-secret-key-change-in-production'
   */
  secret: process.env.CSRF_SECRET || "csrf-secret-key-change-in-production",
  /**
   * Token length in bytes
   */
  tokenLength: 32,
  /**
   * Token expiration time in milliseconds
   */
  expirationMs: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// ============================================================================
// SESSION CONFIGURATION
// ============================================================================
export const SESSION_CONFIG = {
  /**
   * Session expiration time in milliseconds
   */
  expiration: {
    /**
     * Default session expiration (7 days)
     */
    default: 7 * 24 * 60 * 60 * 1000, // 7 days
    /**
     * Remember me session expiration (30 days)
     */
    rememberMe: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  /**
   * Cookie configuration
   */
  cookie: {
    name: "session_token",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    /**
     * Cookie max age in seconds
     */
    maxAge: {
      default: 7 * 24 * 60 * 60, // 7 days in seconds
      rememberMe: 30 * 24 * 60 * 60, // 30 days in seconds
    },
  },
} as const;

// ============================================================================
// AUTHENTICATION CONFIGURATION
// ============================================================================
export const AUTH_CONFIG = {
  /**
   * Cookie name for session token
   */
  sessionCookieName: "session_token",
} as const;

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================
export const DATABASE_CONFIG = {
  /**
   * Default connection pool settings
   */
  pool: {
    max: 10,
    idleTimeout: 20, // seconds
    connectTimeout: 10, // seconds
  },
} as const;

// ============================================================================
// EXPORT ALL CONFIG
// ============================================================================
export const CONFIG = {
  rateLimit: RATE_LIMIT_CONFIG,
  csrf: CSRF_CONFIG,
  session: SESSION_CONFIG,
  auth: AUTH_CONFIG,
  database: DATABASE_CONFIG,
} as const;

