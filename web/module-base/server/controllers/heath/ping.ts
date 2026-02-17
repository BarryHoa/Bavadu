import { NextRequest } from "next/server";

import { JSONResponse } from "@base/server/utils/JSONResponse";

export async function GET(_request: NextRequest) {
  return JSONResponse({
    message: "pong",
    data: {
      timestamp: new Date().toISOString(),
    },
    status: 200,
  });
}
