import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

import { SESSION_CONFIG } from "@base/server/config/session";
import { sessionStore } from "@base/server/stores";

/**
 * POST /api/base/auth/logout
 * Logout user by destroying session
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(SESSION_CONFIG.cookie.name)?.value;

    if (sessionToken) {
      await sessionStore.destroySession(sessionToken);
    }

    // Create response
    const response = JSONResponse({
      message: "Logged out successfully",
      status: 200,
    });

    // Clear session cookie
    response.cookies.delete(SESSION_CONFIG.cookie.name);

    // Clear CSRF token cookie
    response.cookies.delete("csrf-token");

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return JSONResponse({
      error: "Logout failed",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
