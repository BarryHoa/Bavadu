import { NextRequest, NextResponse } from "next/server";

import JsonRpcHandler from "../../rpc/jsonRpcHandler";

// Create RPC handler instance (internal use, no auth/rate limit - handled by middleware)
const rpcHandler = new JsonRpcHandler();

export async function POST(request: NextRequest) {
  // get header X-RPC-Method
  const method = request.headers.get("X-RPC-Method") || "";

  try {
    // Handle JSON-RPC request directly without authentication or rate limiting
    // Authentication and rate limiting are handled by middleware
    const response = await rpcHandler.handle(request);

    response.headers.set("X-RPC-Method", method);

    return response;
  } catch (error) {
    console.error("Internal JSON-RPC handler error:", error);

    const response = NextResponse.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: "Parse error",
          data: error instanceof Error ? error.message : String(error),
        },
        id: null,
      },
      { status: 400 },
    );

    response.headers.set("X-RPC-Method", method);

    return response;
  }
}
