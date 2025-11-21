import { setCsrfTokenCookie } from "@base/server/middleware/csrf";
import { createSignedCsrfToken } from "@base/server/utils/csrf-token";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/base/utils/get-csrf-token
 * Generate and return a CSRF token for the client
 */
export async function GET(request: NextRequest) {
  try {
    // Generate signed CSRF token
    const { token, signedToken, expiresAt } = createSignedCsrfToken();

    // Create response with token
    const response = NextResponse.json({
      success: true,
      data: {
        token,
        expiresAt,
      },
    });

    // Set CSRF token in cookie using helper function
    setCsrfTokenCookie(response);

    return response;
  } catch (error) {
    console.error("CSRF token generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate CSRF token",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

