import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const response = await getModuleQueryByModel({
      model: "location",
      modelMethod: "getCountries",
      params: {},
    });

    return response;
  } catch (error) {
    console.error("Error getting countries:", error);

    return JSONResponse({
      error: "Failed to get countries",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
