import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "../utils/session";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
  session?: {
    id: string;
    userId: string;
    sessionToken: string;
    expiresAt: Date;
  };
}

export interface AuthMiddlewareOptions {
  /**
   * If true, authentication is required. If false, user is optional.
   * @default true
   */
  required?: boolean;
  /**
   * Custom error message when authentication fails
   */
  errorMessage?: string;
}

const SESSION_COOKIE_NAME = "session_token";

/**
 * Get session token from request cookies
 */
function getSessionToken(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value || null;
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
 * Authentication middleware
 * Verifies session token and injects user context into request
 */
export async function withAuth(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<
  | { authenticated: true; request: AuthenticatedRequest }
  | { authenticated: false; response: NextResponse }
> {
  const { required = true, errorMessage = "Authentication required" } =
    options;

  const sessionToken = getSessionToken(request);

  if (!sessionToken) {
    if (required) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { success: false, error: errorMessage },
          { status: 401 }
        ),
      };
    }
    // User is optional, continue without authentication
    return {
      authenticated: true,
      request: request as AuthenticatedRequest,
    };
  }

  try {
    const validationResult = await validateSession(sessionToken);

    if (!validationResult.valid || !validationResult.session) {
      if (required) {
        return {
          authenticated: false,
          response: NextResponse.json(
            { success: false, error: "Invalid or expired session" },
            { status: 401 }
          ),
        };
      }
      // User is optional, continue without authentication
      return {
        authenticated: true,
        request: request as AuthenticatedRequest,
      };
    }

    // Inject user and session into request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = validationResult.user;
    authenticatedRequest.session = {
      id: validationResult.session.id,
      userId: validationResult.session.userId,
      sessionToken: validationResult.session.sessionToken,
      expiresAt: validationResult.session.expiresAt,
    };

    return {
      authenticated: true,
      request: authenticatedRequest,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    if (required) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { success: false, error: "Authentication failed" },
          { status: 500 }
        ),
      };
    }
    // User is optional, continue without authentication
    return {
      authenticated: true,
      request: request as AuthenticatedRequest,
    };
  }
}

/**
 * Helper to get authenticated user from request
 * Returns null if user is not authenticated
 */
export function getAuthenticatedUser(
  request: NextRequest
): { id: string; username: string; avatar?: string } | null {
  const authRequest = request as AuthenticatedRequest;
  return authRequest.user || null;
}

/**
 * Helper to check if request is authenticated
 */
export function isAuthenticated(request: NextRequest): boolean {
  const authRequest = request as AuthenticatedRequest;
  return !!authRequest.user;
}

