/**
 * Rate Limit Store
 * Supports both in-memory and Redis storage
 * Falls back to in-memory if Redis is not available
 */

import { CACHE_NOT_FOUND } from "@base/server/runtime/cache";
import { Debug } from "@base/server/runtime/Debug";
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

    this.store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
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
  private readonly memoryStore: InMemoryRateLimitStore;
  private readonly useRedis: boolean;
  private readonly cachePrefix = "rate-limit:";

  constructor() {
    this.memoryStore = new InMemoryRateLimitStore();
    this.useRedis = this.shouldUseRedis();
    if (this.useRedis) {
      Debug.log("[RateLimitStore] Using Redis for rate limiting");
    } else {
      Debug.log("[RateLimitStore] Using in-memory store");
    }
  }

  private shouldUseRedis(): boolean {
    if (process.env.RATE_LIMIT_USE_REDIS !== "true") {
      return false;
    }
    try {
      const redisCache = RuntimeContext.getInstance().getRedisCache();

      return redisCache?.getStatus().connected ?? false;
    } catch {
      return false;
    }
  }

  private getRedisCache() {
    try {
      return RuntimeContext.getInstance().getRedisCache();
    } catch {
      return undefined;
    }
  }

  async get(key: string): Promise<number> {
    if (!this.useRedis) {
      return this.memoryStore.get(key);
    }

    const cache = this.getRedisCache();

    if (!cache) {
      return this.memoryStore.get(key);
    }

    const cached = await cache.get<RateLimitEntry>(key, {
      prefix: this.cachePrefix,
    });

    if (cached === CACHE_NOT_FOUND) {
      return 0;
    }

    if (Date.now() > cached.resetTime) {
      await this.reset(key);

      return 0;
    }

    return cached.count;
  }

  async increment(key: string, windowMs: number): Promise<number> {
    if (!this.useRedis) {
      return this.memoryStore.increment(key, windowMs);
    }

    const cache = this.getRedisCache();

    if (!cache) {
      return this.memoryStore.increment(key, windowMs);
    }

    const now = Date.now();
    const cached = await cache.get<RateLimitEntry>(key, {
      prefix: this.cachePrefix,
    });

    const isExpired = cached === CACHE_NOT_FOUND || now > cached.resetTime;
    const entry: RateLimitEntry = isExpired
      ? { count: 1, resetTime: now + windowMs }
      : { count: cached.count + 1, resetTime: cached.resetTime };

    const ttl = Math.max(1, Math.ceil((entry.resetTime - now) / 1000));

    await cache.set(key, entry, { prefix: this.cachePrefix, ttl });

    return entry.count;
  }

  async getTimeUntilReset(key: string): Promise<number> {
    if (!this.useRedis) {
      return this.memoryStore.getTimeUntilReset(key);
    }

    const cache = this.getRedisCache();

    if (!cache) {
      return this.memoryStore.getTimeUntilReset(key);
    }

    const cached = await cache.get<RateLimitEntry>(key, {
      prefix: this.cachePrefix,
    });

    if (cached === CACHE_NOT_FOUND) {
      return 0;
    }

    return Math.max(0, cached.resetTime - Date.now());
  }

  async reset(key: string): Promise<void> {
    if (this.useRedis) {
      const cache = this.getRedisCache();

      if (cache) {
        await cache.delete(key, { prefix: this.cachePrefix });
      }
    }
    this.memoryStore.reset(key);
  }

  async clear(): Promise<void> {
    if (this.useRedis) {
      const cache = this.getRedisCache();

      if (cache) {
        await cache.clearPattern("*", { prefix: this.cachePrefix });
      }
    }
    this.memoryStore.clear();
  }

  async size(): Promise<number> {
    return this.memoryStore.size();
  }

  destroy(): void {
    this.memoryStore.destroy();
  }
}

// Export singleton instance
export const rateLimitStore = new RateLimitStore();

// Export classes for testing
export { InMemoryRateLimitStore, RateLimitStore };
