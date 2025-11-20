import { NextRequest, NextResponse } from "next/server";
import {
  createSignedCsrfToken,
  verifyCsrfToken,
  extractCsrfToken,
  CsrfTokenConfig,
} from "../utils/csrf-token";

/**
 * CSRF protection configuration
 */
export interface CsrfProtectionConfig extends CsrfTokenConfig {
  /**
   * Cookie name for CSRF token
   * @default 'csrf-token'
   */
  cookieName?: string;
  /**
   * Header name for CSRF token
   * @default 'X-CSRF-Token'
   */
  headerName?: string;
  /**
   * Whether to require CSRF token for safe methods (GET, HEAD, OPTIONS)
   * @default false
   */
  requireForSafeMethods?: boolean;
  /**
   * Custom error message
   */
  errorMessage?: string;
}

/**
 * Safe HTTP methods that don't modify state
 */
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

/**
 * Default CSRF protection configuration
 */
const defaultConfig: Required<CsrfProtectionConfig> = {
  cookieName: "csrf-token",
  headerName: "X-CSRF-Token",
  requireForSafeMethods: false,
  errorMessage: "CSRF token validation failed",
  secret: process.env.CSRF_SECRET || "csrf-secret-key-change-in-production",
  tokenLength: 32,
  expirationMs: 24 * 60 * 60 * 1000,
};

/**
 * Get CSRF token from request (cookie or header)
 */
function getCsrfTokenFromRequest(
  request: NextRequest,
  config: CsrfProtectionConfig
): string | null {
  const { cookieName, headerName } = {
    ...defaultConfig,
    ...config,
  };

  // Try header first
  const headerToken = request.headers.get(headerName);
  if (headerToken) {
    return headerToken;
  }

  // Try cookie
  const cookieToken = request.cookies.get(cookieName)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Check if request method requires CSRF protection
 */
function requiresCsrfProtection(
  method: string,
  config: CsrfProtectionConfig
): boolean {
  const { requireForSafeMethods } = { ...defaultConfig, ...config };

  if (SAFE_METHODS.includes(method)) {
    return requireForSafeMethods;
  }

  return true;
}

/**
 * CSRF protection middleware
 * Validates CSRF tokens for state-changing requests
 */
export function withCsrfProtection(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: CsrfProtectionConfig = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    const finalConfig = { ...defaultConfig, ...config };
    const method = request.method;

    // Check if CSRF protection is required
    if (!requiresCsrfProtection(method, finalConfig)) {
      return handler(request);
    }

    // Get CSRF token from request
    const csrfToken = getCsrfTokenFromRequest(request, finalConfig);

    if (!csrfToken) {
      return NextResponse.json(
        {
          success: false,
          error: finalConfig.errorMessage,
          message: "CSRF token is required",
        },
        { status: 403 }
      );
    }

    // Verify CSRF token
    const verification = verifyCsrfToken(csrfToken, finalConfig);

    if (!verification.valid) {
      if (verification.expired) {
        return NextResponse.json(
          {
            success: false,
            error: finalConfig.errorMessage,
            message: "CSRF token has expired",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: finalConfig.errorMessage,
          message: "Invalid CSRF token",
        },
        { status: 403 }
      );
    }

    // Token is valid, proceed with handler
    return handler(request);
  };
}

/**
 * CSRF protection middleware for route handlers with params
 */
export function withCsrfProtectionParams<T extends Record<string, string>>(
  handler: (
    request: NextRequest,
    context: { params: Promise<T> }
  ) => Promise<NextResponse>,
  config: CsrfProtectionConfig = {}
): (
  request: NextRequest,
  context: { params: Promise<T> }
) => Promise<NextResponse> {
  return async (
    request: NextRequest,
    context: { params: Promise<T> }
  ): Promise<NextResponse> => {
    const finalConfig = { ...defaultConfig, ...config };
    const method = request.method;

    // Check if CSRF protection is required
    if (!requiresCsrfProtection(method, finalConfig)) {
      return handler(request, context);
    }

    // Get CSRF token from request
    const csrfToken = getCsrfTokenFromRequest(request, finalConfig);

    if (!csrfToken) {
      return NextResponse.json(
        {
          success: false,
          error: finalConfig.errorMessage,
          message: "CSRF token is required",
        },
        { status: 403 }
      );
    }

    // Verify CSRF token
    const verification = verifyCsrfToken(csrfToken, finalConfig);

    if (!verification.valid) {
      if (verification.expired) {
        return NextResponse.json(
          {
            success: false,
            error: finalConfig.errorMessage,
            message: "CSRF token has expired",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: finalConfig.errorMessage,
          message: "Invalid CSRF token",
        },
        { status: 403 }
      );
    }

    // Token is valid, proceed with handler
    return handler(request, context);
  };
}

/**
 * Generate and set CSRF token cookie
 * Use this in routes that need to provide CSRF tokens to clients
 */
export function setCsrfTokenCookie(
  response: NextResponse,
  config: CsrfProtectionConfig = {}
): NextResponse {
  const finalConfig = { ...defaultConfig, ...config };
  const { signedToken } = createSignedCsrfToken(finalConfig);

  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set(finalConfig.cookieName, signedToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: Math.floor(finalConfig.expirationMs / 1000),
    path: "/",
  });

  return response;
}

/**
 * Get CSRF token for client (to include in forms/requests)
 * Returns the token without signature for client-side use
 */
export function getCsrfTokenForClient(
  request: NextRequest,
  config: CsrfProtectionConfig = {}
): string | null {
  const finalConfig = { ...defaultConfig, ...config };
  const cookieToken = request.cookies.get(finalConfig.cookieName)?.value;

  if (!cookieToken) {
    return null;
  }

  return extractCsrfToken(cookieToken);
}

