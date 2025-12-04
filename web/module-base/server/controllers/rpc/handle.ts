import { NextRequest, NextResponse } from "next/server";
import JsonRpcHandler from "../../rpc/jsonRpcHandler";

// Create RPC handler instance (internal use, no auth/rate limit - handled by middleware)
const rpcHandler = new JsonRpcHandler();

export async function POST(request: NextRequest) {
  try {
    // Handle JSON-RPC request directly without authentication or rate limiting
    // Authentication and rate limiting are handled by middleware
    return rpcHandler.handle(request);
  } catch (error) {
    console.error("Internal JSON-RPC handler error:", error);

    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: "Parse error",
          data: error instanceof Error ? error.message : String(error),
        },
        id: null,
      },
      { status: 400 }
    );
  }
}
