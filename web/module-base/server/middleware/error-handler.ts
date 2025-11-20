import { NextRequest, NextResponse } from "next/server";
import { handleError, createErrorResponse, ErrorType } from "../utils/errors";

/**
 * Error handling middleware options
 */
export interface ErrorHandlerOptions {
  /**
   * Custom error handler function
   */
  customHandler?: (error: unknown, request: NextRequest) => NextResponse;
  /**
   * Whether to log errors
   * @default true
   */
  logErrors?: boolean;
}

/**
 * Error handling middleware
 * Wraps route handlers to catch and handle errors safely
 */
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: ErrorHandlerOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  const { customHandler, logErrors = true } = options;

  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      if (customHandler) {
        return customHandler(error, request);
      }

      if (logErrors) {
        // Error logging is handled in createErrorResponse
      }

      return handleError(error);
    }
  };
}

/**
 * Error handling middleware for route handlers with params
 */
export function withErrorHandlerParams<T extends Record<string, string>>(
  handler: (
    request: NextRequest,
    context: { params: Promise<T> }
  ) => Promise<NextResponse>,
  options: ErrorHandlerOptions = {}
): (
  request: NextRequest,
  context: { params: Promise<T> }
) => Promise<NextResponse> {
  const { customHandler, logErrors = true } = options;

  return async (
    request: NextRequest,
    context: { params: Promise<T> }
  ): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (customHandler) {
        return customHandler(error, request);
      }

      if (logErrors) {
        // Error logging is handled in createErrorResponse
      }

      return handleError(error);
    }
  };
}

/**
 * Create a safe error response for API routes
 * Use this in catch blocks instead of exposing raw errors
 */
export function safeErrorResponse(
  error: unknown,
  type: ErrorType = ErrorType.INTERNAL,
  userMessage?: string
): NextResponse {
  return createErrorResponse(error, type, userMessage);
}

