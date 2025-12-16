import { NextRequest } from "next/server";

/**
 * Get authenticated user from request headers
 * Proxy injects user info into headers after authentication
 */
export function getAuthenticatedUser(request: NextRequest): {
  id: string;
  username: string;
  avatar?: string;
} | null {
  const userId = request.headers.get("x-user-id");
  const username = request.headers.get("x-username");

  if (!userId || !username) {
    return null;
  }

  return {
    id: userId,
    username,
    avatar: request.headers.get("x-user-avatar") || undefined,
  };
}

/**
 * Get session info from request headers
 */
export function getSessionInfo(request: NextRequest): {
  id: string;
  token: string;
} | null {
  const sessionId = request.headers.get("x-session-id");
  const sessionToken = request.headers.get("x-session-token");

  if (!sessionId || !sessionToken) {
    return null;
  }

  return {
    id: sessionId,
    token: sessionToken,
  };
}

/**
 * Check if request is authenticated
 */
export function isAuthenticated(request: NextRequest): boolean {
  return !!getAuthenticatedUser(request);
}
