import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return JSONResponse({
        message: "id is required",
        status: 400,
      });
    }

    const response = await getModuleQueryByModel({
      model: "sale.orderB2B",
      modelMethod: "getById",
      params: { id },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get B2B sales order";
    return JSONResponse({ message, status: 400 });
  }
}

