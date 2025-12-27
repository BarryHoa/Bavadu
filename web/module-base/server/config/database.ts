/**
 * Database Configuration
 */

export type DatabaseConfig = {
  /**
   * Default connection pool settings
   */
  pool: {
    /**
     * Maximum number of connections in the pool
     */
    max: number;
    /**
     * Idle timeout in seconds
     */
    idleTimeout: number;
    /**
     * Connection timeout in seconds
     */
    connectTimeout: number;
  };
};

export const DATABASE_CONFIG = {
  /**
   * Default connection pool settings
   */
  pool: {
    max: 10,
    idleTimeout: 20, // seconds
    connectTimeout: 10, // seconds
  },
} as const satisfies DatabaseConfig;
