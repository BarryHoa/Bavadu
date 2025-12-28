/**
 * Session Configuration
 */

export type SessionConfig = {
  /**
   * Session expiration time in milliseconds
   */
  expiration: {
    /**
     * Default session expiration
     */
    default: number;
    /**
     * Remember me session expiration
     */
    rememberMe: number;
  };
  /**
   * Cookie configuration
   */
  cookie: {
    /**
     * Cookie name
     */
    name: string;
    /**
     * HTTP only flag
     */
    httpOnly: boolean;
    /**
     * Secure flag (HTTPS only)
     */
    secure: boolean;
    /**
     * SameSite attribute
     */
    sameSite: "lax" | "strict" | "none";
    /**
     * Cookie path
     */
    path: string;
    /**
     * Cookie max age in seconds
     */
    maxAge: {
      /**
       * Default max age
       */
      default: number;
      /**
       * Remember me max age
       */
      rememberMe: number;
    };
  };
};

export const SESSION_CONFIG = {
  /**
   * Session expiration time in milliseconds
   */
  expiration: {
    /**
     * Default session expiration (3 days)
     */
    default: 3 * 24 * 60 * 60 * 1000, // 3 days
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
      default: 3 * 24 * 60 * 60, // 3 days in seconds
      rememberMe: 30 * 24 * 60 * 60, // 30 days in seconds
    },
  },
} as const satisfies SessionConfig;
