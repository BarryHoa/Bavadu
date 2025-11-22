import { NextRequest, NextResponse } from "next/server";
import { SESSION_CONFIG } from "../../config";
import SessionModel from "../../models/Sessions/SessionModel";

/**
 * POST /api/base/auth/logout
 * Logout user by destroying session
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_CONFIG.cookie.name)?.value;

    if (sessionToken) {
      const sessionModel = new SessionModel();
      await sessionModel.destroySession(sessionToken);
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear session cookie
    response.cookies.delete(SESSION_CONFIG.cookie.name);

    // Clear CSRF token cookie
    response.cookies.delete("csrf-token");

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
