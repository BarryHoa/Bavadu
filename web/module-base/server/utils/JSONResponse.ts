import { NextResponse } from "next/server";

interface JSONResponseOptions {
  status?: number;
  message?: string;
  messages?: string[];
  error?: string;
  data?: unknown;
  [key: string]: unknown; // Allow additional fields like pagination
}

/**
 * Utility function to create standardized JSON responses
 * @param options - Response options
 * @param options.status - HTTP status code (default: 200)
 * @param options.message - Single message string
 * @param options.messages - Array of message strings
 * @param options.error - Error message
 * @param options.data - Response data
 * @returns NextResponse with standardized JSON format
 */
export function JSONResponse(options: JSONResponseOptions = {}): NextResponse {
  const { status = 200, message, messages, error, data, ...rest } = options;

  const responseBody: Record<string, unknown> = { ...rest };

  if (data !== undefined) {
    responseBody.data = data;
  }

  if (error) {
    responseBody.error = error;
  }

  if (message) {
    responseBody.message = message;
  }

  if (messages && messages.length > 0) {
    responseBody.messages = messages;
  }

  return NextResponse.json(responseBody, { status });
}
