/**
 * Shared constants used across client and server
 */

/**
 * Default system timezone
 * Used for date formatting, i18n, and cron scheduling
 */
export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

/**
 * System timezone
 * Can be overridden by environment variable TZ on server-side
 * For client-side, this will use the default value
 *
 * @example
 * // Server-side: Uses process.env.TZ if set, otherwise DEFAULT_TIMEZONE
 * // Client-side: Always uses DEFAULT_TIMEZONE
 */
export const SYSTEM_TIMEZONE =
  typeof process !== "undefined" &&
  process.env &&
  process.env.TZ &&
  typeof process.env.TZ === "string" &&
  process.env.TZ.trim() !== ""
    ? process.env.TZ
    : DEFAULT_TIMEZONE;
