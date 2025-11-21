/**
 * CSRF Token Utilities for Client-side
 */

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "X-CSRF-Token";

/**
 * Get CSRF token from cookie
 */
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Extract plain token from signed token
 * Signed token format: token:signature:expiresAt
 */
export function extractTokenFromSigned(signedToken: string): string | null {
  try {
    const parts = signedToken.split(":");
    return parts[0] || null;
  } catch {
    return null;
  }
}

/**
 * Get CSRF token (plain token) from cookie
 * Returns the plain token that should be sent in X-CSRF-Token header
 */
export function getCsrfToken(): string | null {
  const signedToken = getCsrfTokenFromCookie();
  if (!signedToken) return null;
  return extractTokenFromSigned(signedToken);
}

/**
 * Fetch CSRF token from API
 * This will also set the cookie automatically
 */
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/base/utils/get-csrf-token", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Failed to fetch CSRF token");
      return null;
    }

    const data = await response.json();
    return data.data?.token || null;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return null;
  }
}

/**
 * Get CSRF token, fetch if not available
 */
export async function ensureCsrfToken(): Promise<string | null> {
  // Try to get from cookie first
  let token = getCsrfToken();
  if (token) return token;

  // If not in cookie, fetch from API
  token = await fetchCsrfToken();
  return token;
}

/**
 * Get headers with CSRF token
 */
export async function getHeadersWithCsrf(
  additionalHeaders?: HeadersInit
): Promise<HeadersInit> {
  const token = await ensureCsrfToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(additionalHeaders || {}),
  };

  if (token) {
    (headers as Record<string, string>)[CSRF_HEADER_NAME] = token;
  }

  return headers;
}
