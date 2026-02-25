import { NextRequest } from "next/server";

/**
 * Add application-specific headers for page routes
 * - Locale header from cookie
 * - Workspace module header
 * - Optional session token (for pages to use)
 */
export function addPageHeaders(
  request: NextRequest,
  nextHeaders: Headers,
  pathname: string,
): void {
  // Get locale from cookie and set it to x-locale header
  const cookie = request.headers.get("cookie");
  let locale = "en";

  if (cookie) {
    const localeMatch = cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("NEXT_LOCALE="));

    if (localeMatch) {
      const localeCookie = localeMatch.split("=")[1];

      if (localeCookie) {
        locale = localeCookie;
      }
    }
  }
  nextHeaders.set("x-locale", locale);

  // Handle workspace module header
  if (pathname.startsWith("/workspace/modules/")) {
    const match = pathname.match(/^\/workspace\/modules\/([^/]+)/);

    if (match?.[1]) {
      nextHeaders.set("x-workspace-module", match[1]);
    }
  }
}
