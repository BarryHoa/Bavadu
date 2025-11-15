import { getEnv } from "@base/server";
import { NextRequest, NextResponse } from "next/server";
import type LocationModel from "../../models/Locations/LocationModel";

export async function GET(_request: NextRequest) {
  try {
    const env = getEnv();
    const locationModel = env.getModel("location") as
      | LocationModel
      | undefined;

    if (
      !locationModel ||
      typeof (locationModel as LocationModel).getCountries !== "function"
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

    const countries = await (locationModel as LocationModel).getCountries();

    return NextResponse.json({
      success: true,
      data: countries,
      message: "Countries retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting countries:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get countries",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

