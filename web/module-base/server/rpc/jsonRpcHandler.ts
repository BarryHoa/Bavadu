import { NextRequest, NextResponse } from "next/server";

import { RuntimeContext } from "../runtime/RuntimeContext";
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
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = "JsonRpcError";
  }
}

export const JSON_RPC_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  AUTHENTICATION_ERROR: -32001,
  AUTHORIZATION_ERROR: -32002,
  VALIDATION_ERROR: -32003,
  NOT_FOUND: -32004,
  MODEL_ERROR: -32005,
  MODEL_NOT_FOUND: -32006,
} as const;

// Constants for method structure
const SUB_TYPE_LIST = "list";
const SUB_TYPE_DROPDOWN = "dropdown";
const SUB_TYPE_CRUD = "curd";

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
    const parts = method.split(".");

    if (parts.length < 3) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.INVALID_PARAMS,
        `Invalid model method format. Expected: <model-id>.<sub-type>.<method>\n` +
          `Example: product-category.list.getData, product.curd.create`,
      );
    }

    const [modelId, subType, methodName] = parts;

    // Validate sub-type
    if (
      subType !== SUB_TYPE_LIST &&
      subType !== SUB_TYPE_DROPDOWN &&
      subType !== SUB_TYPE_CRUD
    ) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.INVALID_PARAMS,
        `Invalid model type. Expected: ${SUB_TYPE_LIST}, ${SUB_TYPE_DROPDOWN}, ${SUB_TYPE_CRUD}`,
      );
    }

    // Build model key
    const modelKey = `${modelId}.${subType}`;

    // Get model instance
    const modelInstance = await RuntimeContext.getModelInstanceBy(modelKey);

    if (!modelInstance) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.MODEL_NOT_FOUND,
        `Model "${modelKey}" not found`,
      );
    }

    // Get method function
    const modelMethodFunction = (modelInstance as any)[methodName] as (
      params?: Record<string, any>,
    ) => Promise<any>;

    if (!modelMethodFunction || typeof modelMethodFunction !== "function") {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND,
        `Method "${methodName}" not found on model "${modelKey}"`,
      );
    }

    // Call model method
    return await modelMethodFunction(params || {});
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
    // Validate JSON-RPC version
    if (request.jsonrpc !== this.rpcVersion) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.INVALID_REQUEST,
        `Invalid JSON-RPC version. Only ${this.rpcVersion} is supported`,
      );
    }

    // Validate method exists
    if (!request.method) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.INVALID_REQUEST,
        "Method is required",
      );
    }

    // Validate method format
    const methodValidation = validateJsonRpcMethod(request.method);

    if (!methodValidation.valid) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.INVALID_PARAMS,
        methodValidation.error || "Invalid method format",
      );
    }

    // Sanitize params to prevent XSS
    const sanitizedParams = request.params
      ? sanitizeJsonRpcParams(request.params)
      : undefined;

    try {
      const result = await this.handleDynamicModelQuery(
        request.method,
        sanitizedParams,
        httpRequest,
      );

      return this.createSuccessResponse(result, request.id);
    } catch (error) {
      if (error instanceof JsonRpcError) {
        return this.createErrorResponse(
          error.code,
          error.message,
          error.data,
          request.id,
        );
      }

      console.error("JSON-RPC internal error:", error);

      return this.createErrorResponse(
        JSON_RPC_ERROR_CODES.INTERNAL_ERROR,
        error instanceof Error ? error.message : "Internal error",
        process.env.NODE_ENV === "development" ? String(error) : undefined,
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

        const responses = await Promise.all(
          body.map((request) => this.handleRequest(request, httpRequest)),
        );

        return NextResponse.json(responses);
      }

      // FOR SINGLE REQUEST
      const response = await this.handleRequest(body, httpRequest);

      return NextResponse.json(response);
    } catch (error) {
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
