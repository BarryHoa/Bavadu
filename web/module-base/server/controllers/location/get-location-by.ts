import { getEnv } from "@base/server";
import { NextRequest, NextResponse } from "next/server";
import type LocationModel from "../../models/Locations/LocationModel";

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

    const env = getEnv();
    const locationModel = env.getModel("location") as
      | LocationModel
      | undefined;

    if (
      !locationModel ||
      typeof (locationModel as LocationModel).getLocationBy !== "function"
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

    const administrativeUnits = await (locationModel as LocationModel).getLocationBy(
      {
        parentId,
        type,
      }
    );

    return NextResponse.json({
      success: true,
      data: administrativeUnits,
      message: "Administrative units retrieved successfully",
    });
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

