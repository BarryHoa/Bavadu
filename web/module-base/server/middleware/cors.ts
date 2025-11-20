import { NextRequest, NextResponse } from "next/server";

/**
 * CORS configuration
 */
export interface CorsConfig {
  /**
   * Allowed origins (whitelist)
   * Use '*' for all origins (not recommended for production)
   * @default process.env.ALLOWED_ORIGINS?.split(',') || []
   */
  allowedOrigins?: string[];
  /**
   * Allowed HTTP methods
   * @default ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
   */
  allowedMethods?: string[];
  /**
   * Allowed headers
   * @default ['Content-Type', 'Authorization', 'X-Requested-With']
   */
  allowedHeaders?: string[];
  /**
   * Exposed headers
   * @default []
   */
  exposedHeaders?: string[];
  /**
   * Whether to allow credentials (cookies, authorization headers)
   * @default true
   */
  allowCredentials?: boolean;
  /**
   * Max age for preflight requests (in seconds)
   * @default 86400 (24 hours)
   */
  maxAge?: number;
}

/**
 * Get allowed origins from environment or default
 */
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(",").map((origin) => origin.trim());
  }
  return [];
}

/**
 * Default CORS configuration
 */
const defaultConfig: Required<CorsConfig> = {
  allowedOrigins: getAllowedOrigins(),
  allowedMethods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
    "HEAD",
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
  ],
  exposedHeaders: [],
  allowCredentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(
  origin: string | null,
  allowedOrigins: string[]
): boolean {
  if (!origin) {
    return false;
  }

  // Allow all origins if '*' is in the list (not recommended for production)
  if (allowedOrigins.includes("*")) {
    return true;
  }

  return allowedOrigins.includes(origin);
}

/**
 * Handle CORS preflight request (OPTIONS)
 */
export function handleCorsPreflight(
  request: NextRequest,
  config: CorsConfig = {}
): NextResponse | null {
  const finalConfig = { ...defaultConfig, ...config };
  const origin = request.headers.get("origin");

  // Check if origin is allowed
  if (!isOriginAllowed(origin, finalConfig.allowedOrigins)) {
    return NextResponse.json(
      {
        success: false,
        error: "CORS policy: Origin not allowed",
      },
      { status: 403 }
    );
  }

  // Create preflight response
  const response = new NextResponse(null, { status: 204 });

  // Set CORS headers
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  if (finalConfig.allowCredentials) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    finalConfig.allowedMethods.join(", ")
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    finalConfig.allowedHeaders.join(", ")
  );

  if (finalConfig.exposedHeaders.length > 0) {
    response.headers.set(
      "Access-Control-Expose-Headers",
      finalConfig.exposedHeaders.join(", ")
    );
  }

  response.headers.set(
    "Access-Control-Max-Age",
    String(finalConfig.maxAge)
  );

  return response;
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  config: CorsConfig = {}
): NextResponse {
  const finalConfig = { ...defaultConfig, ...config };
  const origin = request.headers.get("origin");

  // Check if origin is allowed
  if (isOriginAllowed(origin, finalConfig.allowedOrigins)) {
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }

    if (finalConfig.allowCredentials) {
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    if (finalConfig.exposedHeaders.length > 0) {
      response.headers.set(
        "Access-Control-Expose-Headers",
        finalConfig.exposedHeaders.join(", ")
      );
    }
  }

  return response;
}

/**
 * CORS middleware
 * Wraps a route handler to add CORS headers
 */
export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: CorsConfig = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      const preflightResponse = handleCorsPreflight(request, config);
      if (preflightResponse) {
        return preflightResponse;
      }
    }

    // Execute handler
    const response = await handler(request);

    // Apply CORS headers
    return applyCorsHeaders(response, request, config);
  };
}

/**
 * CORS middleware for route handlers with params
 */
export function withCorsParams<T extends Record<string, string>>(
  handler: (
    request: NextRequest,
    context: { params: Promise<T> }
  ) => Promise<NextResponse>,
  config: CorsConfig = {}
): (
  request: NextRequest,
  context: { params: Promise<T> }
) => Promise<NextResponse> {
  return async (
    request: NextRequest,
    context: { params: Promise<T> }
  ): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      const preflightResponse = handleCorsPreflight(request, config);
      if (preflightResponse) {
        return preflightResponse;
      }
    }

    // Execute handler
    const response = await handler(request, context);

    // Apply CORS headers
    return applyCorsHeaders(response, request, config);
  };
}

