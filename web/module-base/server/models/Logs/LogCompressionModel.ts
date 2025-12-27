/**
 * Log Compression Model
 *
 * Handles compression of log files older than specified days into monthly archives
 */

import { LOG_CONFIG } from "@base/server/config/log";
import dayjs from "dayjs";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
} from "fs";
import { basename, extname, join } from "path";
import { pipeline } from "stream/promises";
import { createGzip } from "zlib";

export interface CompressionResult {
  compressed: number;
  totalSize: number;
  compressedSize: number;
  errors: string[];
}

export interface CompressionStats {
  totalFiles: number;
  filesToCompress: number;
  totalSize: number;
  sizeToCompress: number;
}

class LogCompressionModel {
  private readonly baseDir: string;
  private readonly compressAfterDays: number;
  private readonly deleteOriginal: boolean;
  private readonly enabled: boolean;

  constructor() {
    const config = LOG_CONFIG.file.compression;

    this.baseDir = LOG_CONFIG.file.directory;
    this.compressAfterDays = config.compressAfterDays;
    this.deleteOriginal = config.deleteOriginal;
    this.enabled = config.enabled;
  }

  /**
   * Check if a file should be compressed based on age
   */
  private shouldCompress(filePath: string): boolean {
    try {
      const stats = statSync(filePath);
      const fileDate = dayjs(stats.mtime);
      const daysOld = dayjs().diff(fileDate, "day");

      return daysOld >= this.compressAfterDays;
    } catch {
      return false;
    }
  }

  /**
   * Compress a single log file
   */
  private async compressFile(
    filePath: string,
    outputDir: string
  ): Promise<{
    success: boolean;
    originalSize: number;
    compressedSize: number;
    error?: string;
  }> {
    try {
      const stats = statSync(filePath);
      const originalSize = stats.size;
      const fileName = basename(filePath, extname(filePath));
      const fileDate = dayjs(stats.mtime);
      const monthStr = fileDate.format("YYYY-MM");

      // Create output directory for this month
      const monthDir = join(outputDir, monthStr);

      if (!existsSync(monthDir)) {
        mkdirSync(monthDir, { recursive: true });
      }

      // Output file: log_type_YYYY-MM.gz
      const outputFile = join(monthDir, `${fileName}.gz`);

      // Compress file
      const readStream = createReadStream(filePath);
      const writeStream = createWriteStream(outputFile);
      const gzip = createGzip({ level: 6 }); // Level 6 is a good balance

      await pipeline(readStream, gzip, writeStream);

      const compressedStats = statSync(outputFile);
      const compressedSize = compressedStats.size;

      // Delete original if configured
      if (this.deleteOriginal) {
        unlinkSync(filePath);
      }

      return {
        success: true,
        originalSize,
        compressedSize,
      };
    } catch (error) {
      return {
        success: false,
        originalSize: 0,
        compressedSize: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Compress all log files in a directory that are older than specified days
   */
  private async compressLogDirectory(
    logTypeDir: string
  ): Promise<CompressionResult> {
    const result: CompressionResult = {
      compressed: 0,
      totalSize: 0,
      compressedSize: 0,
      errors: [],
    };

    if (!existsSync(logTypeDir)) {
      return result;
    }

    const files = readdirSync(logTypeDir)
      .map((file) => join(logTypeDir, file))
      .filter((filePath) => {
        // Only process .log files
        if (!filePath.endsWith(".log")) {
          return false;
        }
        try {
          return statSync(filePath).isFile();
        } catch {
          return false;
        }
      });

    for (const filePath of files) {
      if (this.shouldCompress(filePath)) {
        const compressionResult = await this.compressFile(
          filePath,
          logTypeDir // Compress into same directory, organized by month
        );

        if (compressionResult.success) {
          result.compressed++;
          result.totalSize += compressionResult.originalSize;
          result.compressedSize += compressionResult.compressedSize;
        } else {
          result.errors.push(
            `${filePath}: ${compressionResult.error || "Unknown error"}`
          );
        }
      }
    }

    return result;
  }

  /**
   * Compress all log files that meet compression criteria
   */
  async compressLogs(): Promise<CompressionResult> {
    if (!this.enabled) {
      return {
        compressed: 0,
        totalSize: 0,
        compressedSize: 0,
        errors: ["Compression is disabled"],
      };
    }

    if (!existsSync(this.baseDir)) {
      return {
        compressed: 0,
        totalSize: 0,
        compressedSize: 0,
        errors: [`Log directory does not exist: ${this.baseDir}`],
      };
    }

    const overallResult: CompressionResult = {
      compressed: 0,
      totalSize: 0,
      compressedSize: 0,
      errors: [],
    };

    // Get all log type directories
    const logTypeDirs = readdirSync(this.baseDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => join(this.baseDir, dirent.name));

    // Process each log type directory
    for (const logTypeDir of logTypeDirs) {
      const result = await this.compressLogDirectory(logTypeDir);

      overallResult.compressed += result.compressed;
      overallResult.totalSize += result.totalSize;
      overallResult.compressedSize += result.compressedSize;
      overallResult.errors.push(...result.errors);
    }

    return overallResult;
  }

  /**
   * Get compression statistics
   */
  getStats(): CompressionStats {
    if (!existsSync(this.baseDir)) {
      return {
        totalFiles: 0,
        filesToCompress: 0,
        totalSize: 0,
        sizeToCompress: 0,
      };
    }

    let totalFiles = 0;
    let filesToCompress = 0;
    let totalSize = 0;
    let sizeToCompress = 0;

    const logTypeDirs = readdirSync(this.baseDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => join(this.baseDir, dirent.name));

    for (const logTypeDir of logTypeDirs) {
      try {
        const files = readdirSync(logTypeDir)
          .map((file) => join(logTypeDir, file))
          .filter((filePath) => {
            if (!filePath.endsWith(".log")) {
              return false;
            }
            try {
              return statSync(filePath).isFile();
            } catch {
              return false;
            }
          });

        for (const filePath of files) {
          try {
            const stats = statSync(filePath);

            totalFiles++;
            totalSize += stats.size;

            if (this.shouldCompress(filePath)) {
              filesToCompress++;
              sizeToCompress += stats.size;
            }
          } catch {
            // Skip files that can't be accessed
          }
        }
      } catch {
        // Skip directories that can't be accessed
      }
    }

    return {
      totalFiles,
      filesToCompress,
      totalSize,
      sizeToCompress,
    };
  }

  /**
   * Initialize compression model
   */
  static initialize(): LogCompressionModel {
    return new LogCompressionModel();
  }
}

// Singleton instance
let logCompressionModelInstance: LogCompressionModel | null = null;

/**
 * Get log compression model instance
 */
export function getLogCompressionModel(): LogCompressionModel {
  if (!logCompressionModelInstance) {
    logCompressionModelInstance = LogCompressionModel.initialize();
  }

  return logCompressionModelInstance;
}

export default LogCompressionModel;
