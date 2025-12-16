import type { IConfigManager } from "./types";

/**
 * Config Manager
 * Manages environment configuration with validation and caching
 */
export class ConfigManager implements IConfigManager {
  private static instance: ConfigManager | null = null;
  private config: Map<string, unknown> = new Map();
  private loaded = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   * @returns ConfigManager instance
   */
  static getInstance(): ConfigManager {
    if (!this.instance) {
      this.instance = new ConfigManager();
    }

    return this.instance;
  }

  /**
   * Load configuration from environment variables
   * This is a lightweight operation that just marks config as loaded
   * Actual config values are read from process.env on demand
   */
  async load(): Promise<void> {
    if (this.loaded) {
      return;
    }

    // In a real implementation, you might want to:
    // 1. Validate required env vars
    // 2. Parse and cache complex configs
    // 3. Set defaults

    // For now, we just mark as loaded
    // Config values are read directly from process.env when needed
    this.loaded = true;
  }

  /**
   * Get configuration value
   * @param key - Config key (environment variable name)
   * @returns Config value or undefined
   */
  get<T = unknown>(key: string): T | undefined {
    if (!this.loaded) {
      throw new Error("Config not loaded. Call load() first.");
    }

    // Read from process.env
    const value = process.env[key];

    return value as T | undefined;
  }

  /**
   * Check if config is loaded
   * @returns True if config is loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Reset config (for testing)
   */
  reset(): void {
    this.config.clear();
    this.loaded = false;
  }
}
