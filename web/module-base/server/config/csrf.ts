/**
 * CSRF Token Configuration
 */

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
