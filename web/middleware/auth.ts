import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/module-base/server/utils/session";

/**
 * Authenticate request and inject user info into headers
 * Returns error response if authentication fails, null otherwise
 */
export async function authenticateRequest(
  request: NextRequest,
  nextHeaders: Headers
): Promise<NextResponse | null> {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken) {
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
    const validationResult = await validateSession(sessionToken);

    if (!validationResult.valid || !validationResult.session) {
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
    console.error("Authentication error:", error);
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

