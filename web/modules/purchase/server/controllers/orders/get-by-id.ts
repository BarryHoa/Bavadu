import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return JSONResponse({
        message: "id query parameter is required",
        status: 400,
      });
    }

    const response = await getModuleQueryByModel({
      model: "purchase.order",
      modelMethod: "getById",
      params: { id },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch purchase order";
    return JSONResponse({ message, status: 500 });
  }
}
