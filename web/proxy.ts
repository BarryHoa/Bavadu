import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/api/base/auth/login",
  "/api/base/auth/logout",
  "/api/base/health",
  "/api/base/health/ping",
];

// Routes that should be excluded from proxy
const EXCLUDED_PATHS = ["/_next", "/static", "/favicon"];

/**
 * Check if a path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if a path should be excluded from proxy
 */
function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Next.js 16 Proxy
 * 
 * According to Next.js 16 docs:
 * - Proxy is for optimistic checks (like checking if cookie exists)
 * - Real authentication should be done in Data Access Layer (route handlers)
 * - Proxy can inject headers for route handlers to use
 * 
 * This proxy:
 * 1. Does optimistic authentication check (session cookie exists)
 * 2. Injects user info headers if session exists (for route handlers)
 * 3. Handles locale and workspace module headers
 */
export async function proxy(req: NextRequest) {
  const { nextUrl, headers } = req;
  const pathname = nextUrl.pathname;
  const nextHeaders = new Headers(headers);

  // Skip excluded paths (static files, Next.js internals)
  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }

  // Get locale from cookie and set it to x-locale header
  const cookie = headers.get("cookie");
  let locale = "en";

  if (cookie) {
    const localeMatch = cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("NEXT_LOCALE="));
    if (localeMatch) {
      const localeCookie = localeMatch.split("=")[1];
      if (localeCookie) {
        locale = localeCookie;
      }
    }
  }
  nextHeaders.set("x-locale", locale);

  // Handle workspace module header
  if (pathname.startsWith("/workspace/modules/")) {
    const match = pathname.match(/^\/workspace\/modules\/([^/]+)/);
    if (match?.[1]) {
      nextHeaders.set("x-workspace-module", match[1]);
    }
  }

  // Optimistic authentication check for API routes
  // Only check if session cookie exists, not full validation
  // Full authentication will be done in route handlers (Data Access Layer)
  if (pathname.startsWith("/api/") && !isPublicRoute(pathname)) {
    const sessionToken = req.cookies.get("session_token")?.value;

    if (!sessionToken) {
      // No session token - route handler will handle the 401 response
      // Proxy just passes through, authentication check happens in route handler
      return NextResponse.next({ request: { headers: nextHeaders } });
    }

    // Session token exists - inject header for route handlers
    // Route handlers will validate the token properly
    nextHeaders.set("x-session-token", sessionToken);
  }

  return NextResponse.next({ request: { headers: nextHeaders } });
}

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
