/**
 * ScheduledTask
 * Extends Kernel and defines the application's scheduled tasks
 */

import SequenceModel from "../module-base/server/models/Sequence/SequenceModel";
import SessionModel from "../module-base/server/models/Sessions/SessionModel";
import { getLogCompressionModel } from "../module-base/server/models/Logs/LogCompressionModel";

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

    // Clear excess sequence counts daily at 4:00 AM (keep 3 per rule)
    this.dailyAt("clear-sequence-counts", "04:00", async () => {
      console.log("[Cron] Starting clear sequence counts...");
      try {
        const sequenceModel = new SequenceModel();
        const { deleted } = await sequenceModel.clearExcessCounts();
        console.log(`[Cron] Cleared ${deleted} excess sequence count(s)`);
      } catch (error) {
        console.error("[Cron] Error clearing sequence counts:", error);
      }
    });

    // Compress log files daily at 2:00 AM
    // Compresses logs older than 30 days into monthly archives
    this.dailyAt("compress-logs", "02:00", async () => {
      console.log("[Cron] Starting log compression...");
      try {
        const compressionModel = getLogCompressionModel();
        const statsBefore = compressionModel.getStats();

        console.log(
          `[Cron] Files to compress: ${statsBefore.filesToCompress}, ` +
            `Size: ${(statsBefore.sizeToCompress / 1024 / 1024).toFixed(2)} MB`,
        );

        const result = await compressionModel.compressLogs();

        if (result.compressed > 0) {
          const compressionRatio = (
            (1 - result.compressedSize / result.totalSize) *
            100
          ).toFixed(1);

          console.log(
            `[Cron] ✅ Compressed ${result.compressed} log files. ` +
              `Original: ${(result.totalSize / 1024 / 1024).toFixed(2)} MB, ` +
              `Compressed: ${(result.compressedSize / 1024 / 1024).toFixed(2)} MB ` +
              `(${compressionRatio}% reduction)`,
          );
        } else {
          console.log("[Cron] No log files to compress");
        }

        if (result.errors.length > 0) {
          console.warn(
            `[Cron] ⚠️  ${result.errors.length} compression errors:`,
          );
          result.errors.forEach((error) => console.warn(`  - ${error}`));
        }
      } catch (error) {
        console.error("[Cron] Error compressing logs:", error);
      }
    });
  }
}
