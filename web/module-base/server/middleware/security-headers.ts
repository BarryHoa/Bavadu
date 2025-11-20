import { NextRequest, NextResponse } from "next/server";

/**
 * Security headers configuration
 */
export interface SecurityHeadersConfig {
  /**
   * Content Security Policy
   * @default "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
   */
  contentSecurityPolicy?: string;
  /**
   * X-Frame-Options
   * @default "DENY"
   */
  xFrameOptions?: "DENY" | "SAMEORIGIN" | string;
  /**
   * X-Content-Type-Options
   * @default "nosniff"
   */
  xContentTypeOptions?: string;
  /**
   * Referrer-Policy
   * @default "strict-origin-when-cross-origin"
   */
  referrerPolicy?: string;
  /**
   * Permissions-Policy (formerly Feature-Policy)
   * @default "geolocation=(), microphone=(), camera=()"
   */
  permissionsPolicy?: string;
  /**
   * Strict-Transport-Security (HSTS)
   * Only set in production
   * @default "max-age=31536000; includeSubDomains; preload"
   */
  strictTransportSecurity?: string;
  /**
   * X-XSS-Protection (legacy, but still useful)
   * @default "1; mode=block"
   */
  xXssProtection?: string;
  /**
   * Whether to enable HSTS (only in production)
   * @default true
   */
  enableHSTS?: boolean;
}

/**
 * Default security headers configuration
 */
const defaultConfig: Required<SecurityHeadersConfig> = {
  contentSecurityPolicy:
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';",
  xFrameOptions: "DENY",
  xContentTypeOptions: "nosniff",
  referrerPolicy: "strict-origin-when-cross-origin",
  permissionsPolicy: "geolocation=(), microphone=(), camera=()",
  strictTransportSecurity: "max-age=31536000; includeSubDomains; preload",
  xXssProtection: "1; mode=block",
  enableHSTS: true,
};

/**
 * Check if we're in production
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = {}
): NextResponse {
  const finalConfig = { ...defaultConfig, ...config };

  // Content-Security-Policy
  if (finalConfig.contentSecurityPolicy) {
    response.headers.set(
      "Content-Security-Policy",
      finalConfig.contentSecurityPolicy
    );
  }

  // X-Frame-Options
  if (finalConfig.xFrameOptions) {
    response.headers.set("X-Frame-Options", finalConfig.xFrameOptions);
  }

  // X-Content-Type-Options
  if (finalConfig.xContentTypeOptions) {
    response.headers.set(
      "X-Content-Type-Options",
      finalConfig.xContentTypeOptions
    );
  }

  // Referrer-Policy
  if (finalConfig.referrerPolicy) {
    response.headers.set("Referrer-Policy", finalConfig.referrerPolicy);
  }

  // Permissions-Policy
  if (finalConfig.permissionsPolicy) {
    response.headers.set("Permissions-Policy", finalConfig.permissionsPolicy);
  }

  // Strict-Transport-Security (only in production)
  if (
    finalConfig.enableHSTS &&
    isProduction() &&
    finalConfig.strictTransportSecurity
  ) {
    response.headers.set(
      "Strict-Transport-Security",
      finalConfig.strictTransportSecurity
    );
  }

  // X-XSS-Protection (legacy but still useful)
  if (finalConfig.xXssProtection) {
    response.headers.set("X-XSS-Protection", finalConfig.xXssProtection);
  }

  return response;
}

/**
 * Security headers middleware
 * Wraps a route handler to add security headers to all responses
 */
export function withSecurityHeaders(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: SecurityHeadersConfig = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request);
    return applySecurityHeaders(response, config);
  };
}

/**
 * Security headers middleware for route handlers with params
 */
export function withSecurityHeadersParams<T extends Record<string, string>>(
  handler: (
    request: NextRequest,
    context: { params: Promise<T> }
  ) => Promise<NextResponse>,
  config: SecurityHeadersConfig = {}
): (
  request: NextRequest,
  context: { params: Promise<T> }
) => Promise<NextResponse> {
  return async (
    request: NextRequest,
    context: { params: Promise<T> }
  ): Promise<NextResponse> => {
    const response = await handler(request, context);
    return applySecurityHeaders(response, config);
  };
}

/**
 * Get security headers as a plain object (useful for Next.js config)
 */
export function getSecurityHeaders(
  config: SecurityHeadersConfig = {}
): Record<string, string> {
  const finalConfig = { ...defaultConfig, ...config };
  const headers: Record<string, string> = {};

  if (finalConfig.contentSecurityPolicy) {
    headers["Content-Security-Policy"] = finalConfig.contentSecurityPolicy;
  }

  if (finalConfig.xFrameOptions) {
    headers["X-Frame-Options"] = finalConfig.xFrameOptions;
  }

  if (finalConfig.xContentTypeOptions) {
    headers["X-Content-Type-Options"] = finalConfig.xContentTypeOptions;
  }

  if (finalConfig.referrerPolicy) {
    headers["Referrer-Policy"] = finalConfig.referrerPolicy;
  }

  if (finalConfig.permissionsPolicy) {
    headers["Permissions-Policy"] = finalConfig.permissionsPolicy;
  }

  if (
    finalConfig.enableHSTS &&
    isProduction() &&
    finalConfig.strictTransportSecurity
  ) {
    headers["Strict-Transport-Security"] =
      finalConfig.strictTransportSecurity;
  }

  if (finalConfig.xXssProtection) {
    headers["X-XSS-Protection"] = finalConfig.xXssProtection;
  }

  return headers;
}

