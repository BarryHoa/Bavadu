import { NextRequest } from "next/server";

/**
 * Extract locale from cookie
 */
function getLocaleFromCookie(request: NextRequest): string {
  const cookie = request.headers.get("cookie");
  if (!cookie) return "en";

  const localeMatch = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("NEXT_LOCALE="));

  if (!localeMatch) return "en";

  const localeCookie = localeMatch.split("=")[1];
  return localeCookie || "en";
}

/**
 * Extract workspace module from pathname
 */
function getWorkspaceModule(pathname: string): string | null {
  if (!pathname.startsWith("/workspace/modules/")) {
    return null;
  }

  const match = pathname.match(/^\/workspace\/modules\/([^/]+)/);
  return match?.[1] || null;
}

/**
 * Add page-specific headers (locale, workspace module, session token)
 */
export function addPageHeaders(
  request: NextRequest,
  pathname: string,
  nextHeaders: Headers
): void {
  // Locale header
  const locale = getLocaleFromCookie(request);
  nextHeaders.set("x-locale", locale);

  // Workspace module header
  const workspaceModule = getWorkspaceModule(pathname);
  if (workspaceModule) {
    nextHeaders.set("x-workspace-module", workspaceModule);
  }

  // Optional session token for pages (not validated here)
  const sessionToken = request.cookies.get("session_token")?.value;
  if (sessionToken) {
    nextHeaders.set("x-session-token", sessionToken);
  }
}

