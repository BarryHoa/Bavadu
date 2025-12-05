/**
 * Database Configuration
 */

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

