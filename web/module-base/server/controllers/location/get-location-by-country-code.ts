import { getEnv } from "@base/server";
import { NextRequest, NextResponse } from "next/server";
import type LocationModel from "../../models/Locations/LocationModel";

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

    const env = getEnv();
    const locationModel = env.getModel("location") as
      | LocationModel
      | undefined;

    if (
      !locationModel ||
      typeof (locationModel as LocationModel).getLocationByCountryCode !==
        "function"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Location model not available",
          message: "The location model is not registered or invalid.",
        },
        { status: 500 }
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

    const administrativeUnits = await (
      locationModel as LocationModel
    ).getLocationByCountryCode(countryCode, params);

    return NextResponse.json({
      success: true,
      data: administrativeUnits,
      message: "Administrative units retrieved successfully",
    });
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

