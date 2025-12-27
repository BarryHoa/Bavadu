/**
 * Debug Configuration
 */

export interface DebugConfig {
  /**
   * Enable debug mode
   * When enabled, provides detailed logging and debugging information
   * @default false
   */
  enabled: boolean;
  /**
   * Log level for debug output
   * @default "debug"
   */
  logLevel: "debug" | "info" | "warn" | "error";
}

/**
 * Debug configuration constant
 * Loaded from environment variables at module initialization
 */
export const DEBUG_CONFIG = {
  /**
   * Enable debug mode
   * Set DEBUG=true in environment to enable
   * @default false
   */
  enabled: process.env.DEBUG === "true" || process.env.DEBUG === "1",
  /**
   * Log level for debug output
   * @default "debug"
   */
  logLevel: (process.env.LOG_LEVEL || "debug") as
    | "debug"
    | "info"
    | "warn"
    | "error",
} as const satisfies DebugConfig;
