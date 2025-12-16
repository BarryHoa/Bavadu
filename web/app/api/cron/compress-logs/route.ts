import { getLogCompressionModel } from "@base/server/models/Logs/LogCompressionModel";
import { initializeRuntime } from "@base/server/utils/initializeRuntime";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, require it in Authorization header
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Initialize runtime (database and environment) if not already initialized
    await initializeRuntime();

    console.log("[Cron] Starting log compression...");
    const compressionModel = getLogCompressionModel();
    const statsBefore = compressionModel.getStats();

    console.log(
      `[Cron] Files to compress: ${statsBefore.filesToCompress}, ` +
        `Size: ${(statsBefore.sizeToCompress / 1024 / 1024).toFixed(2)} MB`
    );

    const result = await compressionModel.compressLogs();

    let message = "";
    if (result.compressed > 0) {
      const compressionRatio = (
        (1 - result.compressedSize / result.totalSize) *
        100
      ).toFixed(1);
      message =
        `Compressed ${result.compressed} log files. ` +
        `Original: ${(result.totalSize / 1024 / 1024).toFixed(2)} MB, ` +
        `Compressed: ${(result.compressedSize / 1024 / 1024).toFixed(2)} MB ` +
        `(${compressionRatio}% reduction)`;
      console.log(`[Cron] ✅ ${message}`);
    } else {
      message = "No log files to compress";
      console.log(`[Cron] ${message}`);
    }

    if (result.errors.length > 0) {
      console.warn(`[Cron] ⚠️  ${result.errors.length} compression errors:`);
      result.errors.forEach((error) => console.warn(`  - ${error}`));
    }

    return NextResponse.json({
      success: true,
      message,
      compressed: result.compressed,
      totalSize: result.totalSize,
      compressedSize: result.compressedSize,
      errors: result.errors,
    });
  } catch (error) {
    console.error("[Cron] Error compressing logs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
