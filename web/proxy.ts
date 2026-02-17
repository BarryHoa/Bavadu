import type { NextRequest } from "next/server";

import {
  addPageHeaders,
  addSecurityHeaders,
  authenticateRequest,
  checkCsrfProtection,
  checkRateLimit,
} from "@base/server/middleware";
import { checkSuspiciousRequest } from "@base/server/utils/request-monitor";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/api/base/auth/login",
  "/api/base/auth/logout",
  "/api/base/internal/public/json-rpc",
  "/api/base/health",
  "/api/base/health/ping",
  "/api/base/media", // Allow public access to media files (images/files) for viewing
  "/login",
  "/reset-password",
  "/",
];

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/workspace", "/api/base/internal/json-rpc"];

// Routes that should be excluded from proxy
const EXCLUDED_PATHS = ["/_next", "/static", "/favicon"];

/**
 * Check if a path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

/**
 * Check if a path is a protected route
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if a path should be excluded from proxy
 */
function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Check if pathname is an API route
 */
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

/**
 * Check if pathname is a page route
 */
function isPageRoute(pathname: string): boolean {
  return !isApiRoute(pathname) && !isExcludedPath(pathname);
}

/**
 * Handle API routes security
 * - Rate limiting
 * - CSRF protection
 * - Authentication
 */
async function handleApiRoute(
  req: NextRequest,
  pathname: string,
  nextHeaders: Headers,
): Promise<NextResponse | null> {
  // 1. Rate Limiting
  const rateLimitResponse = await checkRateLimit(req, pathname);

  if (rateLimitResponse) {
    return addSecurityHeaders(rateLimitResponse);
  }

  // 2. CSRF Protection (skip for public routes and GET requests)
  // Also skip CSRF endpoint itself
  // Upload endpoint requires CSRF even if media viewing is public
  if (
    !isPublicRoute(pathname) &&
    pathname !== "/api/base/utils/get-csrf-token"
  ) {
    const csrfResponse = checkCsrfProtection(req);

    if (csrfResponse) {
      return addSecurityHeaders(csrfResponse);
    }
  } else if (pathname === "/api/base/media/upload") {
    // Upload endpoint requires CSRF protection even though media viewing is public
    const csrfResponse = checkCsrfProtection(req);

    if (csrfResponse) {
      return addSecurityHeaders(csrfResponse);
    }
  }

  // 3. Authentication (skip for public routes)
  // Upload endpoint requires authentication even though media viewing is public
  if (!isPublicRoute(pathname) || pathname === "/api/base/media/upload") {
    const authResponse = await authenticateRequest(req, nextHeaders);

    if (authResponse) {
      return addSecurityHeaders(authResponse);
    }
  }

  return null; // Continue processing
}

/**
 * Handle page routes
 * - Authentication check for protected routes
 * - Locale and workspace headers
 */
async function handlePageRoute(
  req: NextRequest,
  pathname: string,
  nextHeaders: Headers,
): Promise<NextResponse | null> {
  // Check authentication for protected routes
  if (isProtectedRoute(pathname) && !isPublicRoute(pathname)) {
    const authResponse = await authenticateRequest(req, nextHeaders);

    if (authResponse) {
      // Redirect to login page if not authenticated
      const loginUrl = new URL("/login", req.url);

      loginUrl.searchParams.set("redirect", pathname);

      return NextResponse.redirect(loginUrl);
    }
  }

  addPageHeaders(req, nextHeaders, pathname);

  return null;
}

/**
 * Next.js 16 Proxy - Centralized Security Handler
 *
 * This proxy handles all security concerns:
 * - API Routes: Rate limiting, CSRF protection, Authentication
 * - Page Routes: Locale headers, workspace headers, optional auth info
 * - All Routes: Security headers
 */
export async function proxy(req: NextRequest) {
  const { nextUrl, headers } = req;
  const pathname = nextUrl.pathname;
  const nextHeaders = new Headers(headers);

  // Skip excluded paths (static files, Next.js internals)
  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }

  // Check for suspicious requests (non-blocking, just logs)
  checkSuspiciousRequest(req, pathname);

  // Handle API routes
  if (isApiRoute(pathname)) {
    const apiResponse = await handleApiRoute(req, pathname, nextHeaders);

    if (apiResponse) {
      // Record error response for monitoring
      if (apiResponse.status >= 400) {
        const { recordErrorResponse } =
          await import("@base/server/utils/request-monitor");

        recordErrorResponse(req, pathname, apiResponse.status);
      }

      return apiResponse; // Rate limit, CSRF, or auth error
    }
  }

  // Handle page routes
  if (isPageRoute(pathname)) {
    const pageResponse = await handlePageRoute(req, pathname, nextHeaders);

    if (pageResponse) {
      return addSecurityHeaders(pageResponse); // Redirect to login
    }
  }

  // Continue with modified headers
  const response = NextResponse.next({ request: { headers: nextHeaders } });

  // Add security headers to all responses
  return addSecurityHeaders(response);
}
// Next.js 16 uses proxy.ts instead of middleware.ts
// Export config for Next.js to recognize this as the proxy middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
