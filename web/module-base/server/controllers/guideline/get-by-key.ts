import GuidelineModel from "@base/server/models/Guidelines/GuidelineModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

/**
 * GET /api/base/guideline/get-by-key?key=xxx
 * Get guideline content by key
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return JSONResponse({
        error: "Key parameter is required",
        message: "Please provide a key parameter",
        status: 400,
      });
    }

    const guidelineModel = new GuidelineModel();
    const guideline = await guidelineModel.getByKey(key);

    if (!guideline) {
      return JSONResponse({
        error: "Guideline not found",
        message: `Guideline with key "${key}" does not exist`,
        status: 404,
      });
    }

    return JSONResponse({
      data: {
        key: guideline.key,
        content: guideline.content,
        updatedAt: guideline.updatedAt,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error getting guideline:", error);
    return JSONResponse({
      error: "Failed to get guideline",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}

