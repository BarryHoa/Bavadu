import { getMediaServiceModel } from "@base/server/models/Media";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string; filename: string }> }
) {
  try {
    const params = await context.params;
    const { type, filename } = params;

    // Validate type
    if (type !== "image" && type !== "file") {
      return NextResponse.json(
        { error: "Invalid type. Must be 'image' or 'file'" },
        { status: 400 }
      );
    }

    const mediaService = getMediaServiceModel();
    const fileData = await mediaService.getFile(
      type as "image" | "file",
      filename
    );

    if (!fileData) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Return file with appropriate headers
    // Add Content Security Policy for SVG files to prevent XSS
    const headers: HeadersInit = {
      "Content-Type": fileData.mimeType,
      "Content-Length": fileData.size.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    };

    // For SVG files, add CSP to prevent XSS
    if (fileData.mimeType === "image/svg+xml") {
      headers["Content-Security-Policy"] =
        "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'";
    }

    return new NextResponse(fileData.buffer, { headers });
  } catch (error) {
    console.error("Get file error:", error);
    return NextResponse.json(
      {
        error: "Failed to get file",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

