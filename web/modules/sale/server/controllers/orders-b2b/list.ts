import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = await getModuleQueryByModel({
      model: "sale.orderB2B",
      modelMethod: "list",
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list B2B sales orders";
    return JSONResponse({ message, status: 400 });
  }
}

