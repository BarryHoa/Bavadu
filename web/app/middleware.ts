import { NextRequest, NextResponse } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/api/base/auth/login",
  "/api/base/auth/logout",
  "/api/base/health",
  "/api/base/health/ping",
];

// Routes that should be excluded from authentication
const EXCLUDED_PATHS = ["/_next", "/static", "/favicon"];

/**
 * Check if a path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if a path should be excluded from middleware
 */
function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Next.js middleware
 * Applies authentication to API routes
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip excluded paths (static files, Next.js internals)
  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }

  // Skip public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Apply authentication to API routes
  // Note: Authentication is handled in individual route handlers
  // This middleware just ensures the structure is in place
  // Actual auth checks happen in route handlers using withAuth middleware
  if (pathname.startsWith("/api/")) {
    // Let route handlers handle authentication
    return NextResponse.next();
  }

  // For non-API routes, continue normally
  return NextResponse.next();
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

