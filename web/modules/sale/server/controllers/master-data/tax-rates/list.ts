import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = await getModuleQueryByModel({
      model: "sale.masterData",
      modelMethod: "getTaxRates",
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list tax rates";
    return JSONResponse({ message, status: 400 });
  }
}

