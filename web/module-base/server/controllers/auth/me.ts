import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../utils/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    // Authentication is handled by proxy.ts
    // User info is available in headers if authenticated
    const user = getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          message: "You must be authenticated to access this resource",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get current user",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

