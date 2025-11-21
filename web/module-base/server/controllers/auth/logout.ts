import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "../../config";
import SessionModel from "../../models/Sessions/SessionModel";
import { getSessionInfo } from "../../utils/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    // Get session token from headers (injected by proxy) or cookie
    const sessionInfo = getSessionInfo(request);
    const sessionToken =
      sessionInfo?.token ||
      request.cookies.get(AUTH_CONFIG.sessionCookieName)?.value;

    if (sessionToken) {
      // Destroy session
      const sessionModel = new SessionModel();
      await sessionModel.destroySession(sessionToken);
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear session cookie
    response.cookies.delete(AUTH_CONFIG.sessionCookieName);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Logout failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
