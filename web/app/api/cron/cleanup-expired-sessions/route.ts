import SessionModel from "@base/server/models/Sessions/SessionModel";
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

    console.log("[Cron] Starting cleanup expired sessions...");
    const sessionModel = new SessionModel();
    const deletedCount = await sessionModel.cleanupExpiredSessions();

    console.log(`[Cron] Cleaned up ${deletedCount} expired session(s)`);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired session(s)`,
      deletedCount,
    });
  } catch (error) {
    console.error("[Cron] Error cleaning up expired sessions:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
