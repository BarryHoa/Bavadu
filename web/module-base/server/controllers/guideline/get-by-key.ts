import GuidelineModel from "@base/server/models/Guidelines/GuidelineModel";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/base/guideline/get-by-key?key=xxx
 * Get guideline content by key
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: "Key parameter is required",
          message: "Please provide a key parameter",
        },
        { status: 400 }
      );
    }

    const guidelineModel = new GuidelineModel();
    const guideline = await guidelineModel.getByKey(key);

    if (!guideline) {
      return NextResponse.json(
        {
          success: false,
          error: "Guideline not found",
          message: `Guideline with key "${key}" does not exist`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        key: guideline.key,
        content: guideline.content,
        updatedAt: guideline.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting guideline:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get guideline",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

