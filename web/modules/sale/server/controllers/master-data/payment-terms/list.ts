import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = await getModuleQueryByModel({
      model: "sale.masterData",
      modelMethod: "getPaymentTerms",
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list payment terms";
    return JSONResponse({ message, status: 400 });
  }
}

