import { verifyCsrfToken } from "@/module-base/server/utils/csrf-token";
import { rateLimitStore } from "@/module-base/server/utils/rate-limit-store";
import { validateSession } from "@/module-base/server/utils/session";
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

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  // Authentication endpoints - stricter limits
  auth: {
    max: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // General API endpoints
  api: {
    max: 100,
    windowMs: 60 * 1000, // 1 minute
  },
};

// CSRF configuration
const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "X-CSRF-Token";
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

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
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
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
 * Check rate limit for request
 */
function checkRateLimit(
  request: NextRequest,
  pathname: string
): NextResponse | null {
  const ip = getClientIp(request);
  const isAuthRoute = pathname.startsWith("/api/base/auth/");
  const config = isAuthRoute ? RATE_LIMIT_CONFIG.auth : RATE_LIMIT_CONFIG.api;

  const key = `rate-limit:${ip}`;
  const count = rateLimitStore.increment(key, config.windowMs);

  if (count > config.max) {
    const resetTime = Math.ceil(
      (rateLimitStore.getTimeUntilReset(key) + Date.now()) / 1000
    );

    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded",
        message: "Too many requests, please try again later",
        retryAfter: Math.ceil(rateLimitStore.getTimeUntilReset(key) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(config.max),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(resetTime),
          "Retry-After": String(
            Math.ceil(rateLimitStore.getTimeUntilReset(key) / 1000)
          ),
        },
      }
    );
  }

  return null;
}

/**
 * Check CSRF protection for state-changing requests
 */
function checkCsrfProtection(request: NextRequest): NextResponse | null {
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
    if (verification.expired) {
      return NextResponse.json(
        {
          success: false,
          error: "CSRF token validation failed",
          message: "CSRF token has expired",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "CSRF token validation failed",
        message: "Invalid CSRF token",
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  const isProduction = process.env.NODE_ENV === "production";

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
  );

  // X-Frame-Options
  response.headers.set("X-Frame-Options", "DENY");

  // X-Content-Type-Options
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer-Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  // X-XSS-Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Strict-Transport-Security (only in production)
  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

/**
 * Next.js 16 Proxy - Centralized Security Handler
 *
 * This proxy handles all security concerns:
 * 1. Authentication - Validates session tokens
 * 2. Rate Limiting - Prevents abuse
 * 3. CSRF Protection - Validates tokens for state-changing requests
 * 4. Security Headers - Adds security headers to responses
 * 5. Locale & Workspace headers - Application-specific headers
 */
export async function proxy(req: NextRequest) {
  const { nextUrl, headers } = req;
  const pathname = nextUrl.pathname;
  const method = req.method;
  const nextHeaders = new Headers(headers);

  // Skip excluded paths (static files, Next.js internals)
  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }

  // 1. Rate Limiting - Check before processing
  if (pathname.startsWith("/api/")) {
    const rateLimitResponse = checkRateLimit(req, pathname);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse);
    }
  }

  // 2. CSRF Protection - For state-changing requests
  if (pathname.startsWith("/api/") && !isPublicRoute(pathname)) {
    const csrfResponse = checkCsrfProtection(req);
    if (csrfResponse) {
      return addSecurityHeaders(csrfResponse);
    }
  }

  // 3. Authentication - Validate session for protected routes
  if (pathname.startsWith("/api/") && !isPublicRoute(pathname)) {
    const sessionToken = req.cookies.get("session_token")?.value;

    if (!sessionToken) {
      const response = NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          message: "Session token is required",
        },
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    // Validate session token
    try {
      const validationResult = await validateSession(sessionToken);

      if (!validationResult.valid || !validationResult.session) {
        const response = NextResponse.json(
          {
            success: false,
            error: "Authentication failed",
            message: "Invalid or expired session",
          },
          { status: 401 }
        );
        return addSecurityHeaders(response);
      }

      // Inject user info into headers for route handlers
      if (validationResult.user) {
        nextHeaders.set("x-user-id", validationResult.user.id);
        nextHeaders.set("x-username", validationResult.user.username);
        if (validationResult.user.avatar) {
          nextHeaders.set("x-user-avatar", validationResult.user.avatar);
        }
      }
      nextHeaders.set("x-session-id", validationResult.session.id);
      nextHeaders.set("x-session-token", sessionToken);
    } catch (error) {
      console.error("Authentication error:", error);
      const response = NextResponse.json(
        {
          success: false,
          error: "Authentication failed",
          message: "Failed to validate session",
        },
        { status: 500 }
      );
      return addSecurityHeaders(response);
    }
  }

  // 4. Get locale from cookie and set it to x-locale header
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

  // 5. Handle workspace module header
  if (pathname.startsWith("/workspace/modules/")) {
    const match = pathname.match(/^\/workspace\/modules\/([^/]+)/);
    if (match?.[1]) {
      nextHeaders.set("x-workspace-module", match[1]);
    }
  }

  // Continue with modified headers
  const response = NextResponse.next({ request: { headers: nextHeaders } });

  // 6. Add security headers to response
  return addSecurityHeaders(response);
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
