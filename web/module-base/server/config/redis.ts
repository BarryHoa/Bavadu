/**
 * Redis Configuration
 */

export interface RedisConfig {
  enabled: boolean;
  url?: string;
  host: string;
  port: number;
  password?: string;
  db: number;
  retry: {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
  };
  connectionTimeout: number;
  commandTimeout: number;
}

/**
 * Redis configuration constant
 * Loaded from environment variables at module initialization
 */
export const REDIS_CONFIG = {
  /**
   * Enable/disable Redis cache
   * @default false
   */
  enabled: process.env.REDIS_ENABLED === "true",
  /**
   * Redis connection URL (optional, takes precedence over host/port)
   * @example redis://localhost:6379
   */
  url: process.env.REDIS_URL,
  /**
   * Redis host
   * @default localhost
   */
  host: process.env.REDIS_HOST || "localhost",
  /**
   * Redis port
   * @default 6379
   */
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  /**
   * Redis password (optional)
   */
  password: process.env.REDIS_PASSWORD,
  /**
   * Redis database number
   * @default 0
   */
  db: parseInt(process.env.REDIS_DB || "0", 10),
  /**
   * Retry configuration for connection failures
   */
  retry: {
    /**
     * Maximum number of retry attempts
     * @default 3
     */
    maxAttempts: parseInt(process.env.REDIS_RETRY_MAX_ATTEMPTS || "3", 10),
    /**
     * Initial delay between retries in milliseconds
     * @default 1000
     */
    delayMs: parseInt(process.env.REDIS_RETRY_DELAY_MS || "1000", 10),
    /**
     * Backoff multiplier for exponential backoff
     * @default 2
     */
    backoffMultiplier: parseFloat(process.env.REDIS_RETRY_BACKOFF || "2"),
  },
  /**
   * Connection timeout in milliseconds
   * @default 5000
   */
  connectionTimeout: parseInt(
    process.env.REDIS_CONNECTION_TIMEOUT || "5000",
    10
  ),
  /**
   * Command timeout in milliseconds
   * @default 3000
   */
  commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || "3000", 10),
} as const satisfies RedisConfig;
