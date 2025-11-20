import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "../middleware/auth";

/**
 * Wrapper for route handlers that require authentication
 */
export function withAuthHandler(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await withAuth(request, { required: true });

    if (!authResult.authenticated) {
      return authResult.response;
    }

    return handler(authResult.request);
  };
}

/**
 * Wrapper for route handlers with optional authentication
 */
export function withOptionalAuthHandler(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await withAuth(request, { required: false });

    if (!authResult.authenticated) {
      // Still call handler but without user context
      return handler(request as AuthenticatedRequest);
    }

    return handler(authResult.request);
  };
}

