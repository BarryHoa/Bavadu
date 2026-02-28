import { NextRequest, NextResponse } from "next/server";

import { UserPermissionModel } from "../models/UserPermission";
import { RuntimeContext } from "../runtime/RuntimeContext";
import { logHttp } from "../utils/security-logger";
import {
  sanitizeJsonRpcParams,
  validateJsonRpcMethod,
} from "../validation/schemas/jsonrpc";

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: any;
  id?: string | number | null;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: string | number | null;
}

export interface JsonRpcMethod {
  (params: any, request: NextRequest): Promise<any>;
}

export class JsonRpcError extends Error {
  constructor(
    public code: number,
    message?: string,
    public data?: any,
  ) {
    const resolvedMessage =
      message ?? DEFAULT_ERROR_MESSAGES[code] ?? "Unknown error";

    super(resolvedMessage);
    this.name = "JsonRpcError";
  }
}

/**
 * JSON-RPC 2.0 error codes.
 * - Standard codes (-32700 .. -32603): https://www.jsonrpc.org/specification
 * - Server errors (-32000 .. -32099): reserved for implementation-defined errors.
 */
export const JSON_RPC_ERROR_CODES = {
  // Standard (spec section 5.1)
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  /** Model method (e.g. getData, create) not found on model — not HTTP method (POST, PUT). */
  METHOD_NOT_FOUND: -32601,
  /** Params/method wrong structure or format (protocol-level). */
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  // Server / implementation-defined (-32000 .. -32099)
  AUTHENTICATION_ERROR: -32000,
  AUTHORIZATION_ERROR: -32001,
  PERMISSION_DENIED: -32002,
  /** Params structure OK but values fail business/domain validation rules. */
  VALIDATION_ERROR: -32003,
  RESOURCE_NOT_FOUND: -32004,
  MODEL_METHOD_NOT_SUPPORTED: -32005,
} as const;

/** Default messages for each error code when message param is not provided */
const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  [JSON_RPC_ERROR_CODES.PARSE_ERROR]: "Parse error",
  [JSON_RPC_ERROR_CODES.INVALID_REQUEST]: "Invalid Request",
  [JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND]: "Method not found",
  [JSON_RPC_ERROR_CODES.INVALID_PARAMS]: "Invalid params",
  [JSON_RPC_ERROR_CODES.INTERNAL_ERROR]: "Internal error",
  [JSON_RPC_ERROR_CODES.AUTHENTICATION_ERROR]: "Authentication required",
  [JSON_RPC_ERROR_CODES.AUTHORIZATION_ERROR]: "Access denied",
  [JSON_RPC_ERROR_CODES.VALIDATION_ERROR]: "Validation failed",
  [JSON_RPC_ERROR_CODES.RESOURCE_NOT_FOUND]: "Resource not found",
  [JSON_RPC_ERROR_CODES.PERMISSION_DENIED]:
    "You do not have permission to perform this action. Please contact your administrator to get the permission.",
  [JSON_RPC_ERROR_CODES.MODEL_METHOD_NOT_SUPPORTED]:
    "Model method not supported",
};

/** Pathname chứa segment này thì coi là public (không bắt buộc auth). */
const PUBLIC_PATH_SEGMENT = "/public/";

/**
 * Method structure: <model-id>.<sub-type>.<method>
 *
 * Examples:
 * - product.list.getData
 * - product.dropdown.getData
 * - product.curd.create
 * - product.curd.update
 * - product-category.list.getData
 * - product-category.curd.getById
 *
 * Where:
 * - <model-id>: Base model name from module.json (e.g., "product", "product.category")
 * - <sub-type>: "list", "dropdown", or "curd"
 * - <method>: Method name on the model instance (e.g., "getData", "create", "update")
 */

export class JsonRpcHandler {
  private readonly rpcVersion: string = "2.0";
  constructor() {}
  /**
   * Handle dynamic model query using module.json definitions
   * Format: <model-id>.<sub-type>.<method>
   */
  private async handleDynamicModelQuery(
    method: string,
    params: any,
    request: NextRequest,
  ): Promise<any> {
    // Parse method: <model-id>.<sub-type>.<method>
    const methodValidation = validateJsonRpcMethod(method);

    if (!methodValidation?.valid) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND,
        methodValidation.error,
      );
    }

    const { modelId, subType, methodName = "" } = methodValidation.parts ?? {};

    // Build model key
    const modelKey = `${modelId}.${subType}`;

    // Get model instance
    const modelInstance = await RuntimeContext.getModelInstanceBy(modelKey);

    // Get method function
    const modelMethodFunction = (modelInstance as any)?.[methodName] as (
      params?: Record<string, any>,
      request?: NextRequest,
    ) => Promise<any>;

    if (!modelMethodFunction || typeof modelMethodFunction !== "function") {
      throw new JsonRpcError(JSON_RPC_ERROR_CODES.MODEL_METHOD_NOT_SUPPORTED);
    }

    /**
     * CHECK AUTH RULE FOR METHOD
     */

    const pathname = request.nextUrl.pathname;
    const isPublicPath = pathname.includes(PUBLIC_PATH_SEGMENT);
    const getPermissionRequired = (
      modelInstance as {
        getPermissionRequiredForMethod?: (m: string) => unknown;
      }
    ).getPermissionRequiredForMethod;
    // CALL
    const authRule = getPermissionRequired?.call(modelInstance, methodName) as {
      required: boolean;
      permissions?: string[];
    } | null;

    // Only terminate when public path and auth rule is required
    // IF PUBLIC PATH AND AUTH RULE IS REQUIRED, THROW ERROR
    if (isPublicPath && !!authRule?.required) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.AUTHENTICATION_ERROR,
        "This method requires authentication and is not available on the public endpoint",
      );
    }

    // permission check for method if required
    const userId = request.headers.get("x-user-id");

    if (!!authRule?.required) {
      // Need to login to system
      if (!userId) {
        throw new JsonRpcError(JSON_RPC_ERROR_CODES.AUTHENTICATION_ERROR);
      }
      const permissions = authRule?.permissions ?? [];

      // if it has required, but no permissions, throw permission denied error
      if (!permissions.length) {
        throw new JsonRpcError(JSON_RPC_ERROR_CODES.PERMISSION_DENIED);
      }

      const permissionModel = new UserPermissionModel();

      const hasAll = await permissionModel.hasAllPermissions(
        userId,
        permissions,
      );

      if (!hasAll) {
        throw new JsonRpcError(JSON_RPC_ERROR_CODES.PERMISSION_DENIED);
      }
    }

    // Call model method
    return await modelMethodFunction.call(modelInstance, params || {}, request);
  }

  /**
   * Create error response
   */
  private createErrorResponse(
    code: number,
    message: string,
    data?: any,
    id?: string | number | null,
  ): JsonRpcResponse {
    return {
      jsonrpc: "2.0" as const,
      error: {
        code,
        message,
        data,
      },
      id: id ?? null,
    };
  }

  /**
   * Create success response
   */
  private createSuccessResponse(
    result: any,
    id?: string | number | null,
  ): JsonRpcResponse {
    return {
      jsonrpc: "2.0" as const,
      result,
      id: id ?? null,
    };
  }

  /**
   * Handle a single JSON-RPC request
   */
  private async handleRequest(
    request: JsonRpcRequest,
    httpRequest: NextRequest,
  ): Promise<JsonRpcResponse> {
    try {
      // Validate JSON-RPC version
      if (request.jsonrpc !== this.rpcVersion) {
        throw new JsonRpcError(
          JSON_RPC_ERROR_CODES.INVALID_REQUEST,
          `Invalid JSON-RPC version. Only ${this.rpcVersion} is supported`,
        );
      }

      // Sanitize params to prevent XSS
      const sanitizedParams = request.params
        ? sanitizeJsonRpcParams(request.params)
        : undefined;

      const result = await this.handleDynamicModelQuery(
        request.method,
        sanitizedParams,
        httpRequest,
      );

      return this.createSuccessResponse(result, request.id);
    } catch (error) {
      // normalize error
      const errorNormalized = {
        code:
          (error as JsonRpcError)?.code ?? JSON_RPC_ERROR_CODES.INTERNAL_ERROR,
        message: (error as JsonRpcError)?.message ?? "Internal error",
        data: (error as JsonRpcError)?.data ?? undefined,
        ...(error as Record<string, unknown>),
      } as JsonRpcError;

      logHttp(errorNormalized as Error);

      return this.createErrorResponse(
        errorNormalized.code,
        errorNormalized.message,
        errorNormalized.data,
        request.id,
      );
    }
  }

  /**
   * Handle HTTP request (single or batch)
   */
  async handle(httpRequest: NextRequest): Promise<NextResponse> {
    try {
      const body = await httpRequest.json();

      // FOR BATCH REQUEST, each request is a JsonRpcRequest

      if (Array.isArray(body)) {
        if (!body.length) {
          return NextResponse.json(
            this.createErrorResponse(
              JSON_RPC_ERROR_CODES.INVALID_REQUEST,
              "Empty batch request",
            ),
            { status: 400 },
          );
        }

        const responses = await Promise.allSettled(
          body.map((request) => this.handleRequest(request, httpRequest)),
        );

        return NextResponse.json(responses);
      }

      // FOR SINGLE REQUEST
      const response = await this.handleRequest(body, httpRequest);

      return NextResponse.json(response);
    } catch (error) {
      // Log error to console for development

      logHttp(error as Error);

      return NextResponse.json(
        this.createErrorResponse(
          JSON_RPC_ERROR_CODES.PARSE_ERROR,
          "Parse error",
          error instanceof Error ? error.message : String(error),
        ),
        { status: 400 },
      );
    }
  }
}

export default JsonRpcHandler;
