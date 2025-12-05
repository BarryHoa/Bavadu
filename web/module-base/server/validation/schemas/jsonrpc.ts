import * as v from "valibot";
import { escapeHtml, sanitizeObject } from "../../utils/xss-protection";

/**
 * JSON-RPC request schema
 */
export const jsonRpcRequestSchema = v.object({
  jsonrpc: v.literal("2.0"),
  method: v.pipe(
    v.string(),
    v.minLength(1, "Method name is required"),
    v.maxLength(255, "Method name must be at most 255 characters"),
    // Method name should follow pattern: <model-id>.<sub-type>.<method>
    v.regex(
      /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+){2,}$/,
      "Method name must follow format: <model-id>.<sub-type>.<method>"
    )
  ),
  params: v.optional(v.any()),
  id: v.optional(v.union([v.string(), v.number(), v.null()])),
});

/**
 * JSON-RPC batch request schema (array of requests)
 */
export const jsonRpcBatchRequestSchema = v.array(
  jsonRpcRequestSchema,
  "Batch request must be a non-empty array"
);

/**
 * Validate JSON-RPC method name format
 * Format: <model-id>.<sub-type>.<method>
 */
export function validateJsonRpcMethod(method: string): {
  valid: boolean;
  error?: string;
  parts?: { modelId: string; subType: string; methodName: string };
} {
  const parts = method.split(".");

  if (parts.length < 3) {
    return {
      valid: false,
      error:
        "Method name must have at least 3 parts: <model-id>.<sub-type>.<method>",
    };
  }

  const [modelId, subType, ...methodParts] = parts;
  const methodName = methodParts.join(".");

  // Validate sub-type
  const validSubTypes = ["list", "dropdown", "curd"];
  if (!validSubTypes.includes(subType)) {
    return {
      valid: false,
      error: `Invalid sub-type. Must be one of: ${validSubTypes.join(", ")}`,
    };
  }

  // Validate model ID (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(modelId)) {
    return {
      valid: false,
      error:
        "Model ID can only contain letters, numbers, hyphens, and underscores",
    };
  }

  // Validate method name (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(methodName)) {
    return {
      valid: false,
      error:
        "Method name can only contain letters, numbers, hyphens, and underscores",
    };
  }

  return {
    valid: true,
    parts: { modelId, subType, methodName },
  };
}

/**
 * Sanitize JSON-RPC params
 * Recursively sanitizes string values in params object to prevent XSS
 * Uses XSS protection utilities from xss-protection.ts
 */
export function sanitizeJsonRpcParams(params: unknown): unknown {
  if (params === null || params === undefined) {
    return params;
  }

  if (typeof params === "string") {
    // Use escapeHtml from xss-protection utilities
    return escapeHtml(params);
  }

  if (typeof params === "number" || typeof params === "boolean") {
    return params;
  }

  if (Array.isArray(params)) {
    return params.map(sanitizeJsonRpcParams);
  }

  if (typeof params === "object") {
    // Use sanitizeObject from xss-protection utilities for comprehensive sanitization
    return sanitizeObject(params as Record<string, unknown>, {
      escapeHtml: true,
      escapeAttributes: false,
      sanitizeUrls: true, // Sanitize URLs in params to prevent javascript: and data: attacks
      maxDepth: 10,
    });
  }

  return params;
}
