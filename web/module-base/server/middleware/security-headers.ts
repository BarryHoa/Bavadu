import { NextResponse } from "next/server";

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  const isProduction = process.env.NODE_ENV === "production";

  // Content Security Policy
  // Note: 'unsafe-eval' and 'unsafe-inline' are currently required for Next.js
  // and some third-party libraries. Consider implementing nonce-based CSP
  // for better security in the future.
  //
  // To improve CSP security:
  // 1. Generate nonces for inline scripts and styles
  // 2. Use 'nonce-{value}' instead of 'unsafe-inline'
  // 3. Remove 'unsafe-eval' if not needed by your dependencies
  // 4. Consider using 'strict-dynamic' for better compatibility
  const cspDirectives = [
    "default-src 'self'",
    // Scripts: Allow self, unsafe-eval (for Next.js), unsafe-inline (temporary)
    // TODO: Replace with nonce-based CSP
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    // Styles: Allow self and unsafe-inline (for CSS-in-JS libraries)
    // TODO: Replace with nonce-based CSP
    "style-src 'self' 'unsafe-inline'",
    // Images: Allow self, data URIs, and HTTPS images
    "img-src 'self' data: https:",
    // Fonts: Allow self and data URIs
    "font-src 'self' data:",
    // Connections: Only allow same-origin
    "connect-src 'self'",
    // Base URI: Prevent base tag injection
    "base-uri 'self'",
    // Form actions: Only allow same-origin
    "form-action 'self'",
    // Frame ancestors: Prevent clickjacking (redundant with X-Frame-Options but good practice)
    "frame-ancestors 'none'",
    // Upgrade insecure requests in production
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspDirectives);

  // X-Frame-Options
  response.headers.set("X-Frame-Options", "DENY");

  // X-Content-Type-Options
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer-Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );

  // X-XSS-Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Strict-Transport-Security (only in production)
  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  return response;
}
