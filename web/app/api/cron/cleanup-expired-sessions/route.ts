/**
 * Vercel Cron Job: Cleanup Expired Sessions
 * Runs daily at 3:00 AM
 *
 * This endpoint is called by Vercel Cron Jobs
 * Make sure to set CRON_SECRET in Vercel environment variables
 */

import SessionModel from "@base/server/models/Sessions/SessionModel";
import type { SystemRuntimeVariables } from "@base/server/types/global";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate Vercel Cron request
    // Vercel sends a special header: x-vercel-signature
    // For additional security, you can also check CRON_SECRET
    const vercelSignature = request.headers.get("x-vercel-signature");
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, require it in Authorization header
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else if (!vercelSignature) {
      // If no CRON_SECRET is set, at least verify it's from Vercel
      // Note: In production, you should set CRON_SECRET for better security
      console.warn(
        "[Cron] Warning: No CRON_SECRET set and no Vercel signature found"
      );
    }

    // Initialize database if not already initialized
    if (!globalThis.systemRuntimeVariables?.database) {
      const { Database } = await import("@base/server/stores/database");
      const database = new Database(process.cwd());
      await database.initialize();

      globalThis.systemRuntimeVariables = {
        database: database,
      } as SystemRuntimeVariables;
    }

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
      { status: 500 }
    );
  }
}
