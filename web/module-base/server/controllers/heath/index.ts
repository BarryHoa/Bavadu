import { NextRequest } from "next/server";

import { JSONResponse } from "@base/server/utils/JSONResponse";

export async function GET(_request: NextRequest) {
  try {
    return JSONResponse({
      message: "Health check passed",
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      status: 200,
    });
  } catch (error) {
    console.error("Health check error:", error);

    return JSONResponse({
      message: "Health check failed",
      status: 500,
    });
  }
}
