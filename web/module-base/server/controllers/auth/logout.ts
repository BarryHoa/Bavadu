import { NextRequest } from "next/server";

import { JSONResponse } from "@base/server/utils/JSONResponse";
import { SESSION_CONFIG } from "@base/server/config/session";
import SessionModel from "@base/server/models/Sessions/SessionModel";
import { Debug } from "@base/server/runtime/Debug";

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
    const response = JSONResponse({
      message: "Logged out successfully",
      status: 200,
    });

    // Clear cookies via raw Set-Cookie headers (path + expire so browser removes them)
    const expireDate = "Thu, 01 Jan 1970 00:00:00 GMT";
    const path = SESSION_CONFIG.cookie.path;
    const secure =
      process.env.NODE_ENV === "production" ? "; Secure" : "";
    const sessionCookie = `${SESSION_CONFIG.cookie.name}=; Path=${path}; Max-Age=0; Expires=${expireDate}; HttpOnly; SameSite=${SESSION_CONFIG.cookie.sameSite}${secure}`;
    const csrfCookie = `csrf-token=; Path=/; Max-Age=0; Expires=${expireDate}; SameSite=lax${secure}`;
    response.headers.append("Set-Cookie", sessionCookie);
    response.headers.append("Set-Cookie", csrfCookie);

    return response;
  } catch (error) {
    Debug.forceError("Logout error:", error);

    return JSONResponse({
      error: "Logout failed",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
