/**
 * Debug Utility Class
 *
 * Simple debugging utility that respects DEBUG environment variable
 * Usage: Debug.log("message", data)
 */

type LogLevel = "log" | "info" | "warn" | "error" | "debug";

class DebugClass {
  private isEnabled(): boolean {
    // Check if DEBUG is enabled
    // Server-side: checks process.env.DEBUG
    if (typeof process !== "undefined" && process.env) {
      const debugEnv = process.env.DEBUG;
      return debugEnv === "true" || debugEnv === "1";
    }
    // Fallback: if process is not available, return false (disabled)
    return false;
  }

  private doLog(level: LogLevel, force: boolean, ...args: unknown[]): void {
    // Nếu force = true, luôn log bất kể DEBUG có enable hay không
    if (!force && !this.isEnabled()) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[DEBUG] [${timestamp}]`;

    // Tối ưu: sử dụng console[level] trực tiếp thay vì tạo object mỗi lần
    (console[level] as typeof console.log)(prefix, ...args);
  }

  /**
   * Log a message (default log level)
   * Chỉ log khi DEBUG được enable
   * @param args - Arguments to log
   */
  log(...args: unknown[]): void {
    this.doLog("log", false, ...args);
  }

  /**
   * Log an info message
   * Chỉ log khi DEBUG được enable
   * @param args - Arguments to log
   */
  info(...args: unknown[]): void {
    this.doLog("info", false, ...args);
  }

  /**
   * Log a warning message
   * Chỉ log khi DEBUG được enable
   * @param args - Arguments to log
   */
  warn(...args: unknown[]): void {
    this.doLog("warn", false, ...args);
  }

  /**
   * Log an error message
   * Chỉ log khi DEBUG được enable
   * @param args - Arguments to log
   */
  error(...args: unknown[]): void {
    this.doLog("error", false, ...args);
  }

  /**
   * Log a debug message
   * Chỉ log khi DEBUG được enable
   * @param args - Arguments to log
   */
  debug(...args: unknown[]): void {
    this.doLog("debug", false, ...args);
  }

  /**
   * Force log a message (luôn log bất kể DEBUG có enable hay không)
   * @param args - Arguments to log
   */
  forceLog(...args: unknown[]): void {
    this.doLog("log", true, ...args);
  }

  /**
   * Force log an info message (luôn log bất kể DEBUG có enable hay không)
   * @param args - Arguments to log
   */
  forceInfo(...args: unknown[]): void {
    this.doLog("info", true, ...args);
  }

  /**
   * Force log a warning message (luôn log bất kể DEBUG có enable hay không)
   * @param args - Arguments to log
   */
  forceWarn(...args: unknown[]): void {
    this.doLog("warn", true, ...args);
  }

  /**
   * Force log an error message (luôn log bất kể DEBUG có enable hay không)
   * @param args - Arguments to log
   */
  forceError(...args: unknown[]): void {
    this.doLog("error", true, ...args);
  }

  /**
   * Force log a debug message (luôn log bất kể DEBUG có enable hay không)
   * @param args - Arguments to log
   */
  forceDebug(...args: unknown[]): void {
    this.doLog("debug", true, ...args);
  }
}

// Export singleton instance
export const Debug = new DebugClass();
