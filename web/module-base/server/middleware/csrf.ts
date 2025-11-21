import { verifyCsrfToken } from "@base/server/utils/csrf-token";
import { NextRequest, NextResponse } from "next/server";

// CSRF configuration
const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "X-CSRF-Token";
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

/**
 * Check CSRF protection for state-changing requests
 * Returns error response if CSRF validation fails, null otherwise
 */
export function checkCsrfProtection(request: NextRequest): NextResponse | null {
  const method = request.method;

  // Skip CSRF check for safe methods
  if (SAFE_METHODS.includes(method)) {
    return null;
  }

  // Get CSRF token from header or cookie
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const csrfToken = headerToken || cookieToken;

  if (!csrfToken) {
    return NextResponse.json(
      {
        success: false,
        error: "CSRF token validation failed",
        message: "CSRF token is required",
      },
      { status: 403 }
    );
  }

  // Verify CSRF token
  const verification = verifyCsrfToken(csrfToken);

  if (!verification.valid) {
    const message = verification.expired
      ? "CSRF token has expired"
      : "Invalid CSRF token";

    return NextResponse.json(
      {
        success: false,
        error: "CSRF token validation failed",
        message,
      },
      { status: 403 }
    );
  }

  return null;
}
