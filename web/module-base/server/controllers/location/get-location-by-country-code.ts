import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryCode = searchParams.get("countryCode");
    const parentId = searchParams.get("parentId");
    const level = searchParams.get("level");

    if (!countryCode) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid country code",
          message: "Country code is required",
        },
        { status: 400 }
      );
    }

    const params: {
      parentId?: string | null;
      level?: number;
    } = {};

    if (parentId !== null) {
      params.parentId = parentId || null;
    }
    if (level) {
      params.level = parseInt(level, 10);
    }

    const response = await getModuleQueryByModel({
      model: "location",
      modelMethod: "getLocationByCountryCode",
      params: {
        countryCode,
        ...params,
      },
    });

    return response;
  } catch (error) {
    console.error("Error getting location by country code:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get location by country code",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
