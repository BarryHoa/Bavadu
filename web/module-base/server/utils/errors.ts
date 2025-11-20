import { NextResponse } from "next/server";

/**
 * Error types that should be sanitized in production
 */
export enum ErrorType {
  DATABASE = "DATABASE",
  VALIDATION = "VALIDATION",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  NOT_FOUND = "NOT_FOUND",
  BUSINESS_LOGIC = "BUSINESS_LOGIC",
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
}

/**
 * Structured error information
 */
export interface StructuredError {
  type: ErrorType;
  message: string;
  userMessage: string;
  statusCode: number;
  details?: Record<string, unknown>;
  originalError?: Error;
}

/**
 * Check if we're in development mode
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if error message contains sensitive information
 */
function containsSensitiveInfo(message: string): boolean {
  const sensitivePatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /key/i,
    /credential/i,
    /connection string/i,
    /database/i,
    /sql/i,
    /query/i,
    /file path/i,
    /directory/i,
    /stack trace/i,
  ];

  return sensitivePatterns.some((pattern) => pattern.test(message));
}

/**
 * Sanitize error message for production
 */
function sanitizeErrorMessage(message: string): string {
  if (isDevelopment()) {
    return message;
  }

  // If message contains sensitive info, return generic message
  if (containsSensitiveInfo(message)) {
    return "An internal error occurred";
  }

  // Remove file paths and stack trace references
  let sanitized = message
    .replace(/\/[^\s]+/g, "[path]") // Remove file paths
    .replace(/at\s+[^\n]+/g, "") // Remove stack trace lines
    .replace(/Error:\s*/gi, "") // Remove "Error:" prefix
    .trim();

  // Limit message length
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 197) + "...";
  }

  return sanitized || "An error occurred";
}

/**
 * Create a structured error from various error types
 */
export function createStructuredError(
  error: unknown,
  type: ErrorType = ErrorType.INTERNAL,
  userMessage?: string
): StructuredError {
  let message = "An unknown error occurred";
  let originalError: Error | undefined;

  if (error instanceof Error) {
    message = error.message;
    originalError = error;
  } else if (typeof error === "string") {
    message = error;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String((error as { message: unknown }).message);
  }

  const sanitizedMessage = sanitizeErrorMessage(message);
  const defaultUserMessage = userMessage || getDefaultUserMessage(type);

  return {
    type,
    message: sanitizedMessage,
    userMessage: defaultUserMessage,
    statusCode: getStatusCodeForErrorType(type),
    originalError,
  };
}

/**
 * Get default user-friendly message for error type
 */
function getDefaultUserMessage(type: ErrorType): string {
  switch (type) {
    case ErrorType.DATABASE:
      return "A database error occurred. Please try again later.";
    case ErrorType.VALIDATION:
      return "Invalid input provided. Please check your data and try again.";
    case ErrorType.AUTHENTICATION:
      return "Authentication required. Please log in.";
    case ErrorType.AUTHORIZATION:
      return "You don't have permission to perform this action.";
    case ErrorType.NOT_FOUND:
      return "The requested resource was not found.";
    case ErrorType.BUSINESS_LOGIC:
      return "The operation cannot be completed due to business rules.";
    case ErrorType.EXTERNAL:
      return "An external service error occurred. Please try again later.";
    case ErrorType.INTERNAL:
    default:
      return "An unexpected error occurred. Please try again later.";
  }
}

/**
 * Get HTTP status code for error type
 */
function getStatusCodeForErrorType(type: ErrorType): number {
  switch (type) {
    case ErrorType.VALIDATION:
      return 400;
    case ErrorType.AUTHENTICATION:
      return 401;
    case ErrorType.AUTHORIZATION:
      return 403;
    case ErrorType.NOT_FOUND:
      return 404;
    case ErrorType.BUSINESS_LOGIC:
      return 422;
    case ErrorType.DATABASE:
    case ErrorType.EXTERNAL:
    case ErrorType.INTERNAL:
    default:
      return 500;
  }
}

/**
 * Create error response for API
 */
export function createErrorResponse(
  error: unknown,
  type: ErrorType = ErrorType.INTERNAL,
  userMessage?: string,
  additionalDetails?: Record<string, unknown>
): NextResponse {
  const structuredError = createStructuredError(error, type, userMessage);

  // Log error in development or if it's not sensitive
  if (isDevelopment() || !containsSensitiveInfo(structuredError.message)) {
    console.error("Error:", {
      type: structuredError.type,
      message: structuredError.message,
      statusCode: structuredError.statusCode,
      details: additionalDetails,
      stack: structuredError.originalError?.stack,
    });
  } else {
    // Log minimal info in production for sensitive errors
    console.error("Error:", {
      type: structuredError.type,
      statusCode: structuredError.statusCode,
    });
  }

  const responseBody: {
    success: false;
    error: string;
    message: string;
    details?: Record<string, unknown>;
  } = {
    success: false,
    error: structuredError.userMessage,
    message: structuredError.userMessage,
  };

  // Include details in development only
  if (isDevelopment() && structuredError.originalError) {
    responseBody.details = {
      type: structuredError.type,
      originalMessage: structuredError.message,
      ...additionalDetails,
    };
  } else if (additionalDetails && Object.keys(additionalDetails).length > 0) {
    // Include non-sensitive additional details
    responseBody.details = additionalDetails;
  }

  return NextResponse.json(responseBody, {
    status: structuredError.statusCode,
  });
}

/**
 * Handle common error patterns and create appropriate responses
 */
export function handleError(error: unknown): NextResponse {
  // Check for common error patterns
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Database errors
    if (
      message.includes("database") ||
      message.includes("sql") ||
      message.includes("query") ||
      message.includes("connection")
    ) {
      return createErrorResponse(error, ErrorType.DATABASE);
    }

    // Validation errors
    if (
      message.includes("invalid") ||
      message.includes("required") ||
      message.includes("validation") ||
      message.includes("must be")
    ) {
      return createErrorResponse(error, ErrorType.VALIDATION);
    }

    // Not found errors
    if (
      message.includes("not found") ||
      message.includes("does not exist") ||
      message.includes("missing")
    ) {
      return createErrorResponse(error, ErrorType.NOT_FOUND);
    }

    // Authentication errors
    if (
      message.includes("authentication") ||
      message.includes("unauthorized") ||
      message.includes("login")
    ) {
      return createErrorResponse(error, ErrorType.AUTHENTICATION);
    }

    // Authorization errors
    if (
      message.includes("permission") ||
      message.includes("forbidden") ||
      message.includes("access denied")
    ) {
      return createErrorResponse(error, ErrorType.AUTHORIZATION);
    }
  }

  // Default to internal error
  return createErrorResponse(error, ErrorType.INTERNAL);
}

/**
 * Safe error handler wrapper for async route handlers
 */
export function withErrorHandler<
  T extends (...args: any[]) => Promise<NextResponse>,
>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  }) as T;
}
