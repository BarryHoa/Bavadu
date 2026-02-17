import { NextRequest, NextResponse } from "next/server";

import { AUTH_CONFIG } from "@base/server/config/auth";
import SessionModel from "@base/server/models/Sessions/SessionModel";
import {
  getClientIp,
  getUserAgent,
  logAuthFailure,
} from "@base/server/utils/security-logger";

/**
 * Authenticate request and inject user info into headers
 * Returns error response if authentication fails, null otherwise
 */
export async function authenticateRequest(
  request: NextRequest,
  nextHeaders: Headers
): Promise<NextResponse | null> {
  const sessionToken = request.cookies.get(
    AUTH_CONFIG.sessionCookieName
  )?.value;

  if (!sessionToken) {
    logAuthFailure("Missing session token", {
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
      path: request.nextUrl.pathname,
      method: request.method,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Authentication required",
        message: "Session token is required",
      },
      { status: 401 }
    );
  }

  try {
    const sessionModel = new SessionModel();
    const validationResult = await sessionModel.validateSession(sessionToken);

    if (!validationResult.valid || !validationResult.session) {
      logAuthFailure("Invalid or expired session", {
        ip: getClientIp(request),
        userAgent: getUserAgent(request),
        path: request.nextUrl.pathname,
        method: request.method,
        reason: validationResult.valid
          ? "Session expired"
          : "Invalid session token",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed",
          message: "Invalid or expired session",
        },
        { status: 401 }
      );
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

    return null;
  } catch (error) {
    logAuthFailure("Session validation error", {
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
      path: request.nextUrl.pathname,
      method: request.method,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
        message: "Failed to validate session",
      },
      { status: 500 }
    );
  }
}
