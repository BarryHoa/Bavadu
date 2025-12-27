/**
 * Logging Configuration
 */

export type LogConfig = {
  /**
   * Enable or disable logging
   */
  enabled: boolean;
  /**
   * Log destination type
   */
  destination: "file" | "webhook";
  /**
   * File logging configuration
   */
  file: {
    /**
     * Base directory for log files
     */
    directory: string;
    /**
     * Maximum file size in bytes before rotation
     */
    maxSizeBytes: number;
    /**
     * Compression configuration
     */
    compression: {
      /**
       * Enable log compression
       */
      enabled: boolean;
      /**
       * Compress logs older than this many days
       */
      compressAfterDays: number;
      /**
       * Compression format
       */
      format: "gzip" | "zip";
      /**
       * Delete original files after compression
       */
      deleteOriginal: boolean;
    };
  };
  /**
   * Webhook logging configuration
   */
  webhook: {
    /**
     * Webhook URL
     */
    url: string;
    /**
     * Request headers
     */
    headers: Record<string, string>;
  };
};

export const LOG_CONFIG = {
  /**
   * Enable or disable logging
   * @default true
   */
  enabled: true,

  /**
   * Log destination type
   * - 'file': Write to files (default)
   * - 'webhook': Send to webhook API
   */
  destination: "file" as "file" | "webhook",

  /**
   * File logging configuration
   */
  file: {
    /**
     * Base directory for log files
     * @default 'log'
     */
    directory: "log",

    /**
     * Maximum file size in bytes before rotation
     * @default 5 * 1024 * 1024 (5MB)
     */
    maxSizeBytes: 5 * 1024 * 1024,

    /**
     * Compression configuration
     */
    compression: {
      /**
       * Enable log compression
       * @default true
       */
      enabled: true,

      /**
       * Compress logs older than this many days
       * @default 30
       */
      compressAfterDays: 30,

      /**
       * Compression format
       * @default 'gzip'
       */
      format: "gzip" as "gzip" | "zip",

      /**
       * Delete original files after compression
       * @default true
       */
      deleteOriginal: true,
    },
  },

  /**
   * Webhook logging configuration (if destination is 'webhook')
   */
  webhook: {
    url: process.env.LOG_WEBHOOK_URL || "",
    headers: {
      "Content-Type": "application/json",
    },
  },
} as const satisfies LogConfig;
