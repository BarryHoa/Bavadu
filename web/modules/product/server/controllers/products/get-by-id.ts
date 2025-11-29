import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return JSONResponse({
        error: "Invalid product ID",
        message: "Product ID is required",
        status: 400,
      });
    }

    const response = await getModuleQueryByModel({
      model: "product",
      modelMethod: "getProductDetail",
      params: { id },
    });

    return response;
  } catch (error) {
    return JSONResponse({
      error: "Failed to fetch product",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
