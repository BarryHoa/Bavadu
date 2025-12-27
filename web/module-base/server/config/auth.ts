/**
 * Authentication Configuration
 */

export type AuthConfig = {
  /**
   * Cookie name for session token
   */
  sessionCookieName: string;
};

export const AUTH_CONFIG = {
  /**
   * Cookie name for session token
   */
  sessionCookieName: "session_token",
} as const satisfies AuthConfig;
