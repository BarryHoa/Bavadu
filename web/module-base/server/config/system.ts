/**
 * System Configuration
 */

/**
 * Default system timezone
 * Used for date formatting, i18n, and cron scheduling
 */
export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

/**
 * System timezone
 * Can be overridden by environment variable TZ on server-side
 * For server-side, this will use process.env.TZ if set, otherwise DEFAULT_TIMEZONE
 *
 * @example
 * // Server-side: Uses process.env.TZ if set, otherwise DEFAULT_TIMEZONE
 */
export const SYSTEM_TIMEZONE =
  typeof process !== "undefined" &&
  process.env &&
  process.env.TZ &&
  typeof process.env.TZ === "string" &&
  process.env.TZ.trim() !== ""
    ? process.env.TZ
    : DEFAULT_TIMEZONE;

export type SystemConfig = {
  /**
   * Default timezone
   */
  defaultTimezone: string;
  /**
   * System timezone for scheduled tasks, date formatting, and i18n
   * Can be overridden by environment variable TZ
   */
  timezone: string;
};

export const SYSTEM_CONFIG = {
  /**
   * Default timezone
   * @default "Asia/Ho_Chi_Minh"
   */
  defaultTimezone: DEFAULT_TIMEZONE,
  /**
   * System timezone for scheduled tasks, date formatting, and i18n
   * Can be overridden by environment variable TZ
   */
  timezone: SYSTEM_TIMEZONE,
} as const satisfies SystemConfig;
