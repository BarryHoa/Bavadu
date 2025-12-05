import { CSRF_CONFIG } from "@base/server/config";
import {
  createSignedCsrfToken,
  verifyCsrfToken,
} from "@base/server/utils/csrf-token";
import {
  getClientIp,
  getUserAgent,
  logSuspiciousRequest,
} from "@base/server/utils/security-logger";
import { NextRequest, NextResponse } from "next/server";

// CSRF configuration
const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "X-CSRF-Token";
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

/**
 * Check CSRF protection for state-changing requests
 * Implements Double Submit Cookie Pattern:
 * 1. Token in cookie (signed) must match token in header (plain)
 * 2. Verify signature of cookie token
 * Returns error response if CSRF validation fails, null otherwise
 */
export function checkCsrfProtection(request: NextRequest): NextResponse | null {
  const method = request.method;

  // Skip CSRF check for safe methods
  if (SAFE_METHODS.includes(method)) {
    return null;
  }

  // Get tokens from both cookie and header (both are required)
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieSignedToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  // Both are required for Double Submit Cookie Pattern
  if (!headerToken || !cookieSignedToken) {
    logSuspiciousRequest("CSRF token missing", {
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
      path: request.nextUrl.pathname,
      method: request.method,
      reason: !headerToken ? "Missing header token" : "Missing cookie token",
    });

    return NextResponse.json(
      {
        success: false,
        error: "CSRF token validation failed",
        message: "CSRF token is required in both cookie and header",
      },
      { status: 403 }
    );
  }

  // Verify the signed token from cookie
  const verification = verifyCsrfToken(cookieSignedToken);

  if (!verification.valid) {
    const message = verification.expired
      ? "CSRF token has expired"
      : "Invalid CSRF token";

    logSuspiciousRequest("CSRF token validation failed", {
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
      path: request.nextUrl.pathname,
      method: request.method,
      reason: verification.expired
        ? "Token expired"
        : "Invalid token signature",
    });

    return NextResponse.json(
      {
        success: false,
        error: "CSRF token validation failed",
        message,
      },
      { status: 403 }
    );
  }

  // Extract plain token from cookie and compare with header token
  // This is the core of Double Submit Cookie Pattern
  const cookiePlainToken = verification.token;

  if (!cookiePlainToken || cookiePlainToken !== headerToken) {
    logSuspiciousRequest("CSRF token mismatch", {
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
      path: request.nextUrl.pathname,
      method: request.method,
      reason: "Cookie token does not match header token",
    });

    return NextResponse.json(
      {
        success: false,
        error: "CSRF token validation failed",
        message: "CSRF token mismatch between cookie and header",
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Generate and set CSRF token in response cookie
 * Used for initial token generation or token refresh
 */
export function setCsrfTokenCookie(response: NextResponse): void {
  const { signedToken } = createSignedCsrfToken();
  const isProduction = process.env.NODE_ENV === "production";
  const maxAge = Math.floor(CSRF_CONFIG.expirationMs / 1000); // Convert to seconds

  response.cookies.set(CSRF_COOKIE_NAME, signedToken, {
    httpOnly: false, // Allow client-side JavaScript to read it
    secure: isProduction,
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}
