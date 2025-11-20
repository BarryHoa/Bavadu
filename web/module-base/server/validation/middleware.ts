import { NextRequest, NextResponse } from "next/server";
import * as v from "valibot";

/**
 * Validation error response
 */
export interface ValidationError {
  field: string;
  message: string;
  input?: unknown;
}

/**
 * Validate request body against a schema
 */
export async function validateRequest<T extends v.BaseSchema>(
  request: NextRequest,
  schema: T
): Promise<
  | { valid: true; data: v.InferInput<T> }
  | { valid: false; errors: ValidationError[]; response: NextResponse }
> {
  try {
    const body = await request.json();
    const result = v.safeParse(schema, body);

    if (!result.success) {
      const errors: ValidationError[] = result.issues.map((issue) => ({
        field: issue.path?.map((p) => p.key).join(".") || "root",
        message: issue.message,
        input: issue.input,
      }));

      return {
        valid: false,
        errors,
        response: NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            errors,
          },
          { status: 400 }
        ),
      };
    }

    return {
      valid: true,
      data: result.output,
    };
  } catch (error) {
    // JSON parse error or other errors
    return {
      valid: false,
      errors: [
        {
          field: "body",
          message:
            error instanceof Error
              ? error.message
              : "Invalid request body format",
        },
      ],
      response: NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          message:
            error instanceof Error
              ? error.message
              : "Request body must be valid JSON",
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate request query parameters against a schema
 */
export async function validateQuery<T extends v.BaseSchema>(
  request: NextRequest,
  schema: T
): Promise<
  | { valid: true; data: v.InferInput<T> }
  | { valid: false; errors: ValidationError[]; response: NextResponse }
> {
  try {
    const queryParams: Record<string, string> = {};
    request.nextUrl.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const result = v.safeParse(schema, queryParams);

    if (!result.success) {
      const errors: ValidationError[] = result.issues.map((issue) => ({
        field: issue.path?.map((p) => p.key).join(".") || "root",
        message: issue.message,
        input: issue.input,
      }));

      return {
        valid: false,
        errors,
        response: NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            errors,
          },
          { status: 400 }
        ),
      };
    }

    return {
      valid: true,
      data: result.output,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          field: "query",
          message:
            error instanceof Error
              ? error.message
              : "Invalid query parameters",
        },
      ],
      response: NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          message:
            error instanceof Error ? error.message : "Query validation failed",
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate URL parameters (route params) against a schema
 */
export function validateParams<T extends v.BaseSchema>(
  params: Record<string, string | string[] | undefined>,
  schema: T
):
  | { valid: true; data: v.InferInput<T> }
  | { valid: false; errors: ValidationError[]; response: NextResponse } {
  try {
    // Convert params to a plain object
    const paramsObj: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        paramsObj[key] = value[0];
      } else if (value !== undefined) {
        paramsObj[key] = value;
      }
    }

    const result = v.safeParse(schema, paramsObj);

    if (!result.success) {
      const errors: ValidationError[] = result.issues.map((issue) => ({
        field: issue.path?.map((p) => p.key).join(".") || "root",
        message: issue.message,
        input: issue.input,
      }));

      return {
        valid: false,
        errors,
        response: NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            errors,
          },
          { status: 400 }
        ),
      };
    }

    return {
      valid: true,
      data: result.output,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          field: "params",
          message:
            error instanceof Error ? error.message : "Invalid route parameters",
        },
      ],
      response: NextResponse.json(
        {
          success: false,
          error: "Invalid route parameters",
          message:
            error instanceof Error ? error.message : "Parameter validation failed",
        },
        { status: 400 }
      ),
    };
  }
}

