/**
 * Rate Limit Store
 * Supports both in-memory and Redis storage
 * Falls back to in-memory if Redis is not available
 */

import { CACHE_NOT_FOUND } from "@base/server/runtime/cache";
import { RuntimeContext } from "@base/server/runtime/RuntimeContext";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class InMemoryRateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  get(key: string): number {
    const entry = this.store.get(key);

    if (!entry) {
      return 0;
    }

    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return 0;
    }

    return entry.count;
  }

  increment(key: string, windowMs: number): number {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return 1;
    }

    entry.count++;
    return entry.count;
  }

  getTimeUntilReset(key: string): number {
    const entry = this.store.get(key);

    if (!entry) {
      return 0;
    }

    const remaining = entry.resetTime - Date.now();
    return Math.max(0, remaining);
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.store.delete(key);
    });
  }

  size(): number {
    return this.store.size;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

class RateLimitStore {
  private memoryStore: InMemoryRateLimitStore;
  private useRedis: boolean = false;

  constructor() {
    this.memoryStore = new InMemoryRateLimitStore();
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      const context = RuntimeContext.getInstance();
      await context.ensureInitialized();
      const redisCache = context.getRedisCache();

      if (redisCache && redisCache.getStatus().connected) {
        this.useRedis = true;
        console.log("[RateLimitStore] Using Redis for rate limiting");
      } else {
        console.log(
          "[RateLimitStore] Using in-memory store (Redis not available)"
        );
      }
    } catch (error) {
      console.warn(
        "[RateLimitStore] Failed to initialize Redis, using in-memory store:",
        error
      );
      this.useRedis = false;
    }
  }

  private async getRedisCache() {
    try {
      const context = RuntimeContext.getInstance();
      await context.ensureInitialized();
      return context.getRedisCache();
    } catch {
      return undefined;
    }
  }

  /**
   * Get current count for a key
   */
  async get(key: string): Promise<number> {
    if (this.useRedis) {
      const cache = await this.getRedisCache();
      if (cache) {
        const cached = await cache.get<RateLimitEntry>(key, {
          prefix: "rate-limit:",
        });
        if (cached !== CACHE_NOT_FOUND) {
          // Check if expired
          if (Date.now() > cached.resetTime) {
            await this.reset(key);
            return 0;
          }
          return cached.count;
        }
      }
    }

    return this.memoryStore.get(key);
  }

  /**
   * Increment count for a key
   */
  async increment(key: string, windowMs: number): Promise<number> {
    if (this.useRedis) {
      const cache = await this.getRedisCache();
      if (cache) {
        const now = Date.now();
        const cached = await cache.get<RateLimitEntry>(key, {
          prefix: "rate-limit:",
        });

        if (cached === CACHE_NOT_FOUND || Date.now() > cached.resetTime) {
          // Create new entry
          const entry: RateLimitEntry = {
            count: 1,
            resetTime: now + windowMs,
          };
          const ttl = Math.ceil(windowMs / 1000);
          await cache.set(key, entry, { prefix: "rate-limit:", ttl });
          return 1;
        }

        // Increment existing entry
        const newEntry: RateLimitEntry = {
          count: cached.count + 1,
          resetTime: cached.resetTime,
        };
        const ttl = Math.ceil((cached.resetTime - now) / 1000);
        await cache.set(key, newEntry, { prefix: "rate-limit:", ttl });
        return newEntry.count;
      }
    }

    return this.memoryStore.increment(key, windowMs);
  }

  /**
   * Get time until reset (in milliseconds)
   */
  async getTimeUntilReset(key: string): Promise<number> {
    if (this.useRedis) {
      const cache = await this.getRedisCache();
      if (cache) {
        const cached = await cache.get<RateLimitEntry>(key, {
          prefix: "rate-limit:",
        });
        if (cached !== CACHE_NOT_FOUND) {
          const remaining = cached.resetTime - Date.now();
          return Math.max(0, remaining);
        }
      }
    }

    return this.memoryStore.getTimeUntilReset(key);
  }

  /**
   * Reset count for a key
   */
  async reset(key: string): Promise<void> {
    if (this.useRedis) {
      const cache = await this.getRedisCache();
      if (cache) {
        await cache.delete(key, { prefix: "rate-limit:" });
      }
    }

    this.memoryStore.reset(key);
  }

  /**
   * Clear all entries
   */
  async clear(): Promise<void> {
    if (this.useRedis) {
      const cache = await this.getRedisCache();
      if (cache) {
        await cache.clearPattern("*", { prefix: "rate-limit:" });
      }
    }

    this.memoryStore.clear();
  }

  /**
   * Get store size (for monitoring)
   */
  async size(): Promise<number> {
    // Redis doesn't have a direct size method, return memory store size
    return this.memoryStore.size();
  }

  /**
   * Destroy the store and cleanup interval
   */
  destroy(): void {
    this.memoryStore.destroy();
  }
}

// Export singleton instance
export const rateLimitStore = new RateLimitStore();

// Export classes for testing
export { InMemoryRateLimitStore, RateLimitStore };
