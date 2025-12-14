/**
 * Log Model
 *
 * Handles logging to files with rotation and compression support
 */

import dayjs from "dayjs";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  statSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { LOG_CONFIG } from "../../config";
import { LogGroup, LogSeverity, LogType, LogTypesToGroups } from "./LogTypes";

export interface LogEntry {
  timestamp: string;
  type: LogType;
  severity: LogSeverity;
  message: string;
  metadata: Record<string, unknown>;
}

class LogModel {
  private readonly baseDirectory: string;
  private readonly maxSizeBytes: number;
  private readonly enabled: boolean;
  private readonly destination: "file" | "webhook";
  private readonly currentFiles: Map<string, { path: string; size: number }> =
    new Map();

  constructor() {
    this.enabled = LOG_CONFIG.enabled;
    this.destination = LOG_CONFIG.destination;
    this.baseDirectory = LOG_CONFIG.file.directory;
    this.maxSizeBytes = LOG_CONFIG.file.maxSizeBytes;

    if (
      this.enabled &&
      this.destination === "file" &&
      process.env.VERCEL !== "1"
    ) {
      this.ensureDirectoryExists();
    }
  }

  /**
   * Ensure log directory exists
   */
  private ensureDirectoryExists(): void {
    if (!existsSync(this.baseDirectory)) {
      mkdirSync(this.baseDirectory, { recursive: true });
    }
  }

  /**
   * Ensure group directory exists (cached check)
   */
  private readonly groupDirsCache = new Set<string>();

  /**
   * Get log group for a log type
   */
  private getLogGroup(logType: LogType): LogGroup {
    const group = LogTypesToGroups.get(logType);
    if (!group) {
      // Fallback to application if not found
      return LogGroup.APPLICATION;
    }
    return group;
  }

  /**
   * Ensure group directory exists
   */
  private ensureGroupDirectory(logType: LogType): string {
    const group = this.getLogGroup(logType);
    const groupDir = join(this.baseDirectory, group);
    if (!this.groupDirsCache.has(groupDir) && !existsSync(groupDir)) {
      mkdirSync(groupDir, { recursive: true });
      this.groupDirsCache.add(groupDir);
    }
    return groupDir;
  }

  /**
   * Get log file path for a specific log type and date
   * Structure: log/{group}/{type}_DD_MM_YYYY[_number].log
   */
  private getLogFilePath(
    logType: LogType,
    date: dayjs.Dayjs,
    chunkNumber: number = 0
  ): string {
    const dateStr = date.format("DD_MM_YYYY");
    const groupDir = this.ensureGroupDirectory(logType);

    const fileName =
      chunkNumber === 0
        ? `${logType}_${dateStr}.log`
        : `${logType}_${dateStr}_${chunkNumber}.log`;

    return join(groupDir, fileName);
  }

  /**
   * Get or create current log file for a log type
   */
  private getCurrentLogFile(logType: LogType): string {
    const today = dayjs();
    const dateKey = today.format("YYYY-MM-DD");
    const cacheKey = `${logType}_${dateKey}`;

    // Check if we have a cached file for today
    const cached = this.currentFiles.get(cacheKey);
    if (cached?.path && existsSync(cached.path)) {
      try {
        const stats = statSync(cached.path);
        if (stats.size < this.maxSizeBytes) {
          return cached.path;
        }
      } catch {
        // File was deleted or inaccessible, continue to create new one
      }
    }

    // Find the next available chunk number
    let chunkNumber = 0;
    let filePath = this.getLogFilePath(logType, today, chunkNumber);

    while (existsSync(filePath)) {
      try {
        const stats = statSync(filePath);
        if (stats.size < this.maxSizeBytes) {
          // This file is still under size limit, use it
          this.currentFiles.set(cacheKey, { path: filePath, size: stats.size });
          return filePath;
        }
      } catch {
        // File inaccessible, try next chunk
      }
      // File is too large, try next chunk
      chunkNumber++;
      filePath = this.getLogFilePath(logType, today, chunkNumber);
    }

    // Create new file
    this.currentFiles.set(cacheKey, { path: filePath, size: 0 });
    return filePath;
  }

  /**
   * Format log entry to string
   */
  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, type, severity, message, metadata } = entry;

    const metadataStr = Object.entries(metadata)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(" ");

    return `[SECURITY] [${severity.toUpperCase()}] [${type}] ${timestamp} ${message} ${metadataStr}\n`;
  }

  /**
   * Write log to file
   */
  private async writeToFile(entry: LogEntry): Promise<void> {
    try {
      const filePath = this.getCurrentLogFile(entry.type);
      const logLine = this.formatLogEntry(entry);

      if (existsSync(filePath)) {
        appendFileSync(filePath, logLine, "utf8");
      } else {
        // Ensure directory exists (should already exist, but double-check)
        const dir = dirname(filePath);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        writeFileSync(filePath, logLine, "utf8");
      }

      // Update cached file size
      const today = dayjs();
      const dateKey = today.format("YYYY-MM-DD");
      const cacheKey = `${entry.type}_${dateKey}`;
      const cached = this.currentFiles.get(cacheKey);
      if (cached?.path === filePath) {
        try {
          const stats = statSync(filePath);
          cached.size = stats.size;
        } catch {
          // Ignore errors when updating cache
        }
      }
    } catch (error) {
      // Fallback to console if file write fails
      console.error("Failed to write log to file:", error);
      console.error(this.formatLogEntry(entry).trim());
    }
  }

  /**
   * Send log to webhook
   */
  private async writeToWebhook(entry: LogEntry): Promise<void> {
    try {
      const response = await fetch(LOG_CONFIG.webhook.url, {
        method: "POST",
        headers: LOG_CONFIG.webhook.headers,
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }
    } catch (error) {
      // Fallback to console if webhook fails
      console.error("Failed to send log to webhook:", error);
      console.error(this.formatLogEntry(entry).trim());
    }
  }

  /**
   * Write log entry
   */
  async write(entry: LogEntry): Promise<void> {
    if (!this.enabled) {
      return;
    }

    // On Vercel, only use console
    if (process.env.VERCEL === "1") {
      console.error(this.formatLogEntry(entry).trim());
      return;
    }

    if (this.destination === "file") {
      await this.writeToFile(entry);
    } else if (this.destination === "webhook") {
      await this.writeToWebhook(entry);
    } else {
      console.error(this.formatLogEntry(entry).trim());
    }
  }

  /**
   * Initialize logging system
   */
  static initialize(): LogModel {
    return new LogModel();
  }
}

// Singleton instance
let logModelInstance: LogModel | null = null;

/**
 * Get log model instance
 */
export function getLogModel(): LogModel {
  if (!logModelInstance) {
    logModelInstance = LogModel.initialize();
  }
  return logModelInstance;
}

export default LogModel;
