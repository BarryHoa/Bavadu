import { createClient } from "redis";

import { DEBUG_CONFIG } from "../../config/debug";
import { RedisClientManager, RedisStatus } from "./RedisClientManager";

export const CACHE_NOT_FOUND = Symbol("CACHE_NOT_FOUND");

export type CacheResult<T> = T | typeof CACHE_NOT_FOUND;

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
}

export class RedisCache {
  private client: ReturnType<typeof createClient> | null = null;
  private manager: RedisClientManager;
  private defaultPrefix = "bavadu:";
  private defaultTtl = 3600; // 1 hour
  private clientCheckInterval: NodeJS.Timeout | null = null;

  constructor(manager: RedisClientManager) {
    this.manager = manager;
    this.client = this.manager.getClient();

    // Update client reference periodically when reconnected
    this.clientCheckInterval = setInterval(() => {
      this.client = this.manager.getClient();
    }, 5000);
  }

  private getKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || this.defaultPrefix;
    DEBUG_CONFIG.enabled &&
      console.log(
        `[RedisCache] Getting key "${key}" with prefix "${keyPrefix}"`
      );
    return `${keyPrefix}${key}`;
  }

  private checkStatus(): boolean {
    if (!this.manager.isConnected()) {
      return false;
    }

    DEBUG_CONFIG.enabled && console.log(`[RedisCache] Checking status`);
    this.client = this.manager.getClient();
    return this.client !== null;
  }

  /**
   * Get value from cache
   * Returns CACHE_NOT_FOUND if key doesn't exist or Redis is unavailable
   */
  async get<T = any>(
    key: string,
    options?: CacheOptions
  ): Promise<CacheResult<T>> {
    DEBUG_CONFIG.enabled &&
      console.log(
        `[RedisCache] Getting value for key "${key}" with prefix "${options?.prefix}"`
      );
    if (!this.checkStatus()) {
      return CACHE_NOT_FOUND;
    }

    try {
      const fullKey = this.getKey(key, options?.prefix);
      const value = await this.client!.get(fullKey);

      if (value === null) {
        return CACHE_NOT_FOUND;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`[RedisCache] Get error for key "${key}":`, error);
      return CACHE_NOT_FOUND;
    }
  }

  /**
   * Set value in cache
   */
  async set<T = any>(
    key: string,
    value: T,
    options?: CacheOptions
  ): Promise<boolean> {
    DEBUG_CONFIG.enabled &&
      console.log(
        `[RedisCache] Setting value for key "${key}" with prefix "${options?.prefix}"`
      );
    if (!this.checkStatus()) {
      return false;
    }

    try {
      const fullKey = this.getKey(key, options?.prefix);
      const serialized = JSON.stringify(value);
      const ttl = options?.ttl ?? this.defaultTtl;

      if (ttl > 0) {
        await this.client!.setEx(fullKey, ttl, serialized);
      } else {
        await this.client!.set(fullKey, serialized);
      }

      return true;
    } catch (error) {
      console.error(`[RedisCache] Set error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string, options?: CacheOptions): Promise<boolean> {
    DEBUG_CONFIG.enabled &&
      console.log(
        `[RedisCache] Deleting key "${key}" with prefix "${options?.prefix}"`
      );
    if (!this.checkStatus()) {
      return false;
    }

    try {
      const fullKey = this.getKey(key, options?.prefix);
      const result = await this.client!.del(fullKey);
      return result > 0;
    } catch (error) {
      console.error(`[RedisCache] Delete error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys: string[], options?: CacheOptions): Promise<number> {
    DEBUG_CONFIG.enabled &&
      console.log(
        `[RedisCache] Deleting multiple keys with prefix "${options?.prefix}"`
      );
    if (!this.checkStatus() || keys.length === 0) {
      return 0;
    }

    try {
      const fullKeys = keys.map((key) => this.getKey(key, options?.prefix));
      // Redis del accepts multiple keys - use array as argument
      const result = await (this.client!.del as any)(fullKeys);
      return result;
    } catch (error) {
      console.error(`[RedisCache] DeleteMany error:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    DEBUG_CONFIG.enabled &&
      console.log(
        `[RedisCache] Checking if key "${key}" with prefix "${options?.prefix}" exists`
      );
    if (!this.checkStatus()) {
      return false;
    }

    try {
      const fullKey = this.getKey(key, options?.prefix);
      const result = await this.client!.exists(fullKey);
      return result > 0;
    } catch (error) {
      console.error(`[RedisCache] Exists error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Get TTL of a key
   */
  async getTtl(key: string, options?: CacheOptions): Promise<number> {
    DEBUG_CONFIG.enabled &&
      console.log(
        `[RedisCache] Getting TTL for key "${key}" with prefix "${options?.prefix}"`
      );
    if (!this.checkStatus()) {
      return -1;
    }

    try {
      const fullKey = this.getKey(key, options?.prefix);
      return await this.client!.ttl(fullKey);
    } catch (error) {
      console.error(`[RedisCache] TTL error for key "${key}":`, error);
      return -1;
    }
  }

  /**
   * Increment value
   */
  async increment(
    key: string,
    by: number = 1,
    options?: CacheOptions
  ): Promise<number | null> {
    DEBUG_CONFIG.enabled &&
      console.log(
        `[RedisCache] Incrementing key "${key}" with prefix "${options?.prefix}" by ${by}`
      );
    if (!this.checkStatus()) {
      return null;
    }

    try {
      const fullKey = this.getKey(key, options?.prefix);
      return await this.client!.incrBy(fullKey, by);
    } catch (error) {
      console.error(`[RedisCache] Increment error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Get cache status
   */
  getStatus(): {
    enabled: boolean;
    status: RedisStatus;
    connected: boolean;
  } {
    DEBUG_CONFIG.enabled &&
      console.log(
        `[RedisCache] Getting status: ${this.manager.getStatus()} ${this.manager.isConnected()}`
      );
    return {
      enabled: this.manager.getStatus() !== RedisStatus.DISABLED,
      status: this.manager.getStatus(),
      connected: this.manager.isConnected(),
    };
  }

  /**
   * Clear cache by pattern
   */
  async clearPattern(pattern: string, options?: CacheOptions): Promise<number> {
    DEBUG_CONFIG.enabled &&
      console.log(
        `[RedisCache] Clearing pattern "${pattern}" with prefix "${options?.prefix}"`
      );
    if (!this.checkStatus()) {
      return 0;
    }

    try {
      const fullPattern = this.getKey(pattern, options?.prefix);
      const keys: string[] = [];

      for await (const key of this.client!.scanIterator({
        MATCH: fullPattern,
        COUNT: 100,
      })) {
        keys.push(String(key));
      }

      if (keys.length > 0) {
        // Delete keys one by one or use pipeline for better performance
        let deleted = 0;
        for (const key of keys) {
          const result = await this.client!.del(key);
          deleted += result;
        }
        return deleted;
      }

      return 0;
    } catch (error) {
      console.error(
        `[RedisCache] ClearPattern error for pattern "${pattern}":`,
        error
      );
      return 0;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    DEBUG_CONFIG.enabled && console.log(`[RedisCache] Destroying cache`);
    if (this.clientCheckInterval) {
      clearInterval(this.clientCheckInterval);
      this.clientCheckInterval = null;
    }
  }
}
