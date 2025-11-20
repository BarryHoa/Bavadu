/**
 * In-memory rate limit store
 * For production, consider using Redis or a distributed cache
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Get current count for a key
   */
  get(key: string): number {
    const entry = this.store.get(key);

    if (!entry) {
      return 0;
    }

    // Check if entry has expired
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return 0;
    }

    return entry.count;
  }

  /**
   * Increment count for a key
   */
  increment(key: string, windowMs: number): number {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return 1;
    }

    // Increment existing entry
    entry.count++;
    return entry.count;
  }

  /**
   * Reset count for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Get time until reset for a key
   */
  getTimeUntilReset(key: string): number {
    const entry = this.store.get(key);

    if (!entry) {
      return 0;
    }

    const remaining = entry.resetTime - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key);
      }
    });

    for (const key of keysToDelete) {
      this.store.delete(key);
    }
  }

  /**
   * Clear all entries (useful for testing)
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get store size (useful for monitoring)
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Destroy the store and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Singleton instance
export const rateLimitStore = new RateLimitStore();

