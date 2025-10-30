import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { nextUrl, headers } = req;
  const pathname = nextUrl.pathname;
  const nextHeaders = new Headers(headers);
  // add x-workspace-module header for the request when pathname is /workspace/modules/:module
// add locale header for the request when pathname is /workspace/modules/:module
// nextHeaders.set("x-workspace-module", match[1]);
  // Get the locale from the cookie and set it to x-locale
  const cookie = headers.get("cookie");
  let locale = 'en'

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

  if (pathname.startsWith("/workspace/modules/")) {
    const match = pathname.match(/^\/workspace\/modules\/([^/]+)/);
    if (match?.[1]) {
      nextHeaders.set("x-workspace-module", match[1]);
    }
  }

  return NextResponse.next({ request: { headers: nextHeaders } });
}

export const config = {
  matcher: ["/workspace/:path*"],
};
