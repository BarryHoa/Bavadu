import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const type = searchParams.get("type");

    if (!parentId || !type) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          message: "Parent ID and type are required",
        },
        { status: 400 }
      );
    }

    const response = await getModuleQueryByModel({
      model: "location",
      modelMethod: "getLocationBy",
      params: {
        parentId,
        type,
      },
    });

    return response;
  } catch (error) {
    console.error("Error getting location by parent and type:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get location by parent and type",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
