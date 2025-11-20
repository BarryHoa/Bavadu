import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "../../middleware/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request, { required: true });

    if (!authResult.authenticated) {
      return authResult.response;
    }

    const { user } = authResult.request;

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

