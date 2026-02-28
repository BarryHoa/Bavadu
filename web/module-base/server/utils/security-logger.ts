/* eslint-disable no-console */
/**
 * Security Logger Utility
 *
 * Provides structured logging for security-related events:
 * - Authentication failures
 * - Authorization failures
 * - Suspicious requests
 * - Rate limit violations
 */

import { getLogModel, type LogEntry } from "../models/Logs/LogModel";
import { LogSeverity, LogType } from "../models/Logs/LogTypes";

/**
 * Format security log entry (for console output)
 */
function formatSecurityLog(entry: LogEntry): string {
  const { timestamp, type, severity, message, metadata } = entry;

  const metadataStr = Object.entries(metadata)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(" ");

  return `[SECURITY] [${severity.toUpperCase()}] [${type}] ${timestamp} ${message} ${metadataStr}`;
}

/**
 * Write log entry using LogModel
 */
async function writeLog(
  type: LogType,
  severity: LogSeverity,
  message: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    type,
    severity,
    message,
    metadata,
  };

  // Also output to console for development/debugging
  if (process.env.NODE_ENV === "development") {
    const formatted = formatSecurityLog(entry);

    if (severity === "high" || severity === "critical") {
      console.error(formatted);
    } else if (severity === "medium") {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  } else {
    // Write using LogModel
    const logModel = getLogModel();

    await logModel.write(entry);
  }
}

/**
 * Log authentication failure
 */
export function logAuthFailure(
  reason: string,
  metadata: {
    ip?: string;
    userAgent?: string;
    path?: string;
    method?: string;
    username?: string;
    userId?: string;
    [key: string]: unknown;
  } = {},
): void {
  writeLog(
    LogType.AUTH_FAILURE,
    LogSeverity.HIGH,
    `Authentication failure: ${reason}`,
    {
      ...metadata,
      reason,
    },
  ).catch((error) => {
    console.error("Failed to write auth failure log:", error);
  });
}

/**
 * Log authentication success (for audit trail)
 */
export function logAuthSuccess(metadata: {
  ip?: string;
  userAgent?: string;
  path?: string;
  userId: string;
  username: string;
}): void {
  // Only log in development or if explicitly enabled
  if (
    process.env.LOG_AUTH_SUCCESS === "true" ||
    process.env.NODE_ENV === "development"
  ) {
    writeLog(
      LogType.AUTH_SUCCESS,
      LogSeverity.LOW,
      "Authentication successful",
      metadata,
    ).catch((error) => {
      console.error("Failed to write auth success log:", error);
    });
  }
}

/**
 * Log authorization failure
 */
export function logAuthzFailure(
  reason: string,
  metadata: {
    ip?: string;
    userAgent?: string;
    path?: string;
    method?: string;
    userId?: string;
    username?: string;
    requiredPermission?: string;
    [key: string]: unknown;
  } = {},
): void {
  writeLog(
    LogType.AUTHZ_FAILURE,
    LogSeverity.HIGH,
    `Authorization failure: ${reason}`,
    {
      ...metadata,
      reason,
    },
  ).catch((error) => {
    console.error("Failed to write authz failure log:", error);
  });
}

/**
 * Log suspicious request
 */
export function logSuspiciousRequest(
  reason: string,
  metadata: {
    ip?: string;
    userAgent?: string;
    path?: string;
    method?: string;
    userId?: string;
    [key: string]: unknown;
  } = {},
): void {
  writeLog(
    LogType.SUSPICIOUS_REQUEST,
    LogSeverity.MEDIUM,
    `Suspicious request detected: ${reason}`,
    {
      ...metadata,
      reason,
    },
  ).catch((error) => {
    console.error("Failed to write suspicious request log:", error);
  });
}

/**
 * Log rate limit violation
 */
export function logRateLimitViolation(
  metadata: {
    ip?: string;
    userAgent?: string;
    path?: string;
    method?: string;
    limit?: number;
    window?: number;
    [key: string]: unknown;
  } = {},
): void {
  writeLog(
    LogType.RATE_LIMIT,
    LogSeverity.MEDIUM,
    "Rate limit exceeded",
    metadata,
  ).catch((error) => {
    console.error("Failed to write rate limit log:", error);
  });
}

export function logHttp(
  error: Error | string,
  metadata: Record<string, unknown> = {},
): void {
  const type = (metadata?.logType as LogType) ?? LogType.HTTP_ERROR;
  const severity = (metadata?.logSeverity as LogSeverity) ?? LogSeverity.LOW;

  writeLog(
    type,
    severity,
    "HTTP error: " + (error instanceof Error ? error.message : String(error)),
    {
      ...metadata,
      error: error instanceof Error ? error.message : String(error),
    },
  ).catch((error) => {
    console.error("Failed to write http error log:", error);
  });
}
/**
 * Get client IP from request
 * Supports both NextRequest and objects with headers property
 */
export function getClientIp(request: {
  headers: Headers | { get: (key: string) => string | null };
}): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

/**
 * Get user agent from request
 * Supports both NextRequest and objects with headers property
 */
export function getUserAgent(request: {
  headers: Headers | { get: (key: string) => string | null };
}): string {
  const headers = request.headers;

  return headers.get("user-agent") || "unknown";
}
