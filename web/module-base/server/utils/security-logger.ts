/**
 * Security Logger Utility
 *
 * Provides structured logging for security-related events:
 * - Authentication failures
 * - Authorization failures
 * - Suspicious requests
 * - Rate limit violations
 */

interface SecurityLogEntry {
  timestamp: string;
  type:
    | "auth_failure"
    | "auth_success"
    | "authz_failure"
    | "suspicious_request"
    | "rate_limit";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  metadata: {
    ip?: string;
    userAgent?: string;
    path?: string;
    method?: string;
    userId?: string;
    username?: string;
    reason?: string;
    [key: string]: unknown;
  };
}

/**
 * Format security log entry
 */
function formatSecurityLog(entry: SecurityLogEntry): string {
  const { timestamp, type, severity, message, metadata } = entry;

  const metadataStr = Object.entries(metadata)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(" ");

  return `[SECURITY] [${severity.toUpperCase()}] [${type}] ${timestamp} ${message} ${metadataStr}`;
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
  } = {}
): void {
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    type: "auth_failure",
    severity: "high",
    message: `Authentication failure: ${reason}`,
    metadata: {
      ...metadata,
      reason,
    },
  };

  console.error(formatSecurityLog(entry));
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
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    type: "auth_success",
    severity: "low",
    message: "Authentication successful",
    metadata,
  };

  // Only log in development or if explicitly enabled
  if (
    process.env.LOG_AUTH_SUCCESS === "true" ||
    process.env.NODE_ENV === "development"
  ) {
    console.log(formatSecurityLog(entry));
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
  } = {}
): void {
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    type: "authz_failure",
    severity: "high",
    message: `Authorization failure: ${reason}`,
    metadata: {
      ...metadata,
      reason,
    },
  };

  console.error(formatSecurityLog(entry));
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
  } = {}
): void {
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    type: "suspicious_request",
    severity: "medium",
    message: `Suspicious request detected: ${reason}`,
    metadata: {
      ...metadata,
      reason,
    },
  };

  console.warn(formatSecurityLog(entry));
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
  } = {}
): void {
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    type: "rate_limit",
    severity: "medium",
    message: "Rate limit exceeded",
    metadata,
  };

  console.warn(formatSecurityLog(entry));
}

/**
 * Get client IP from request
 */
export function getClientIp(request: { headers: Headers }): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: { headers: Headers }): string {
  return request.headers.get("user-agent") || "unknown";
}
