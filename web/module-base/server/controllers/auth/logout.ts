import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "../../utils/session";
import { withAuth } from "../../middleware/auth";

const SESSION_COOKIE_NAME = "session_token";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const authResult = await withAuth(request, { required: false });

    // Get session token from cookie
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      // Destroy session
      await destroySession(sessionToken);
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear session cookie
    response.cookies.delete(SESSION_COOKIE_NAME);

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

