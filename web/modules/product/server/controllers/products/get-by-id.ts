import { NextRequest, NextResponse } from "next/server";
import getModuleQueryByModel from "@/module-base/server/utils/getModuleQueryByModel";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    const response = await getModuleQueryByModel({
      model: "product",
      modelMethod: "getProductDetail",
      params: { id },
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
