/**
 * Session Configuration
 */

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
