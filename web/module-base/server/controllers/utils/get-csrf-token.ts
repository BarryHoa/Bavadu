import { NextRequest } from "next/server";

import { createSignedCsrfToken } from "@base/server/utils/csrf-token";
import { JSONResponse } from "@base/server/utils/JSONResponse";

/**
 * GET /api/base/utils/get-csrf-token
 * Generate and return a CSRF token for the client
 */
export async function GET(request: NextRequest) {
  try {
    // Generate signed CSRF token
    const { token, signedToken, expiresAt } = createSignedCsrfToken();

    // Create response with token
    const response = JSONResponse({
      data: {
        token,
        expiresAt,
      },
      status: 200,
    });

    // Set the same signed token in cookie (not generating a new one)
    const isProduction = process.env.NODE_ENV === "production";
    const maxAge = Math.floor((expiresAt - Date.now()) / 1000); // Convert to seconds

    response.cookies.set("csrf-token", signedToken, {
      httpOnly: false, // Allow client-side JavaScript to read it
      secure: isProduction,
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("CSRF token generation error:", error);

    return JSONResponse({
      error: "Failed to generate CSRF token",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
