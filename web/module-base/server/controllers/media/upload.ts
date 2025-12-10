import { getMediaServiceModel } from "@base/server/models/Media";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return JSONResponse({
        error: "No file provided",
        status: 400,
      });
    }

    const mediaService = getMediaServiceModel();
    const result = await mediaService.upload(file);

    return JSONResponse({
      data: result,
      message: "File uploaded successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return JSONResponse({
      error: "Failed to upload file",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}

