/**
 * Request Monitor Utility
 *
 * Monitors requests for suspicious patterns and anomalies
 */

import { NextRequest } from "next/server";
import { getClientIp, logSuspiciousRequest } from "./security-logger";

interface RequestMetrics {
  ip: string;
  path: string;
  method: string;
  userAgent: string;
  timestamp: number;
}

// In-memory store for request tracking (in production, use Redis or similar)
const requestHistory: Map<string, RequestMetrics[]> = new Map();
const MAX_HISTORY_SIZE = 1000;
const SUSPICIOUS_PATTERNS = {
  // Too many requests to different endpoints in short time
  RAPID_ENDPOINT_CHANGES: {
    threshold: 10,
    windowMs: 60000, // 1 minute
  },
  // Too many 4xx/5xx errors
  HIGH_ERROR_RATE: {
    threshold: 5,
    windowMs: 60000, // 1 minute
  },
  // Suspicious user agents
  SUSPICIOUS_USER_AGENTS: [
    /^$/, // Empty user agent
    /curl/i,
    /wget/i,
    /python/i,
    /bot/i,
    /crawler/i,
    /scanner/i,
  ],
  // Suspicious paths
  SUSPICIOUS_PATHS: [
    /\.\./, // Path traversal
    /\/admin/i,
    /\/wp-admin/i,
    /\/phpmyadmin/i,
    /\/\.env/i,
    /\/config/i,
    /\/\.git/i,
  ],
};

/**
 * Clean up old request history
 */
function cleanupHistory() {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes

  const entries = Array.from(requestHistory.entries());
  for (const [ip, history] of entries) {
    const filtered = history.filter(
      (entry: RequestMetrics) => now - entry.timestamp < maxAge
    );
    if (filtered.length === 0) {
      requestHistory.delete(ip);
    } else {
      requestHistory.set(ip, filtered);
    }
  }

  // Limit total history size
  if (requestHistory.size > MAX_HISTORY_SIZE) {
    const entries = Array.from(requestHistory.entries());
    entries.sort((a, b) => {
      const aLatest = a[1][a[1].length - 1]?.timestamp || 0;
      const bLatest = b[1][b[1].length - 1]?.timestamp || 0;
      return aLatest - bLatest;
    });
    const toRemove = entries.slice(0, entries.length - MAX_HISTORY_SIZE);
    toRemove.forEach(([ip]) => requestHistory.delete(ip));
  }
}

/**
 * Check for suspicious patterns in request
 */
export function checkSuspiciousRequest(
  request: NextRequest,
  pathname: string
): void {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "";
  const method = request.method;

  // Check suspicious user agents
  for (const pattern of SUSPICIOUS_PATTERNS.SUSPICIOUS_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      logSuspiciousRequest("Suspicious user agent detected", {
        ip,
        userAgent,
        path: pathname,
        method,
      });
      return;
    }
  }

  // Check suspicious paths
  for (const pattern of SUSPICIOUS_PATTERNS.SUSPICIOUS_PATHS) {
    if (pattern.test(pathname)) {
      logSuspiciousRequest("Suspicious path detected", {
        ip,
        userAgent,
        path: pathname,
        method,
      });
      return;
    }
  }

  // Track request for pattern analysis
  if (!requestHistory.has(ip)) {
    requestHistory.set(ip, []);
  }

  const history = requestHistory.get(ip)!;
  const now = Date.now();

  history.push({
    ip,
    path: pathname,
    method,
    userAgent,
    timestamp: now,
  });

  // Check for rapid endpoint changes
  const recentRequests = history.filter(
    (entry) =>
      now - entry.timestamp <
      SUSPICIOUS_PATTERNS.RAPID_ENDPOINT_CHANGES.windowMs
  );

  if (
    recentRequests.length >=
    SUSPICIOUS_PATTERNS.RAPID_ENDPOINT_CHANGES.threshold
  ) {
    const uniquePaths = new Set(recentRequests.map((r) => r.path));
    if (
      uniquePaths.size >= SUSPICIOUS_PATTERNS.RAPID_ENDPOINT_CHANGES.threshold
    ) {
      logSuspiciousRequest("Rapid endpoint changes detected", {
        ip,
        userAgent,
        path: pathname,
        method,
        uniquePaths: uniquePaths.size,
        totalRequests: recentRequests.length,
      });
    }
  }

  // Cleanup old history periodically
  if (Math.random() < 0.1) {
    // 10% chance to cleanup on each request
    cleanupHistory();
  }
}

/**
 * Record error response for monitoring
 */
export function recordErrorResponse(
  request: NextRequest,
  pathname: string,
  statusCode: number
): void {
  // Only track 4xx and 5xx errors
  if (statusCode < 400 || statusCode >= 600) {
    return;
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "";

  // Log high error rates
  if (statusCode >= 500) {
    logSuspiciousRequest("Server error detected", {
      ip,
      userAgent,
      path: pathname,
      method: request.method,
      statusCode,
    });
  }
}

/**
 * Get request statistics for an IP
 */
export function getRequestStats(ip: string): {
  totalRequests: number;
  uniquePaths: number;
  recentRequests: number;
} {
  const history = requestHistory.get(ip) || [];
  const now = Date.now();
  const recentWindow = 60000; // 1 minute

  const recent = history.filter(
    (entry) => now - entry.timestamp < recentWindow
  );
  const uniquePaths = new Set(history.map((r) => r.path));

  return {
    totalRequests: history.length,
    uniquePaths: uniquePaths.size,
    recentRequests: recent.length,
  };
}
