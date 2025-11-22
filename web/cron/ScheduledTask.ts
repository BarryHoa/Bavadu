/**
 * ScheduledTask
 * Extends Kernel and defines the application's scheduled tasks
 */

import SessionModel from "../module-base/server/models/Sessions/SessionModel";
import { Kernel } from "./Kernel";

export class ScheduledTask extends Kernel {
  /**
   * Define the application's task schedule
   */
  protected schedule(): void {
    // Cleanup expired sessions daily at 3:00 AM
    this.dailyAt("cleanup-expired-sessions", "03:00", async () => {
      console.log("[Cron] Starting cleanup expired sessions...");
      try {
        const sessionModel = new SessionModel();
        const deletedCount = await sessionModel.cleanupExpiredSessions();
        console.log(`[Cron] Cleaned up ${deletedCount} expired session(s)`);
      } catch (error) {
        console.error("[Cron] Error cleaning up expired sessions:", error);
      }
    });

    // Add more scheduled tasks here
    // Example:
    // this.hourly("hourly-task", () => {
    //   console.log("Running hourly task");
    // });
  }
}
