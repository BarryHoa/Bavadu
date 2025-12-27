/**
 * Session Store
 * Supports both database and Redis caching
 * Redis is used for fast session validation, database is source of truth
 */

import { CACHE_NOT_FOUND } from "@base/server/runtime/cache";
import { RuntimeContext } from "@base/server/runtime/RuntimeContext";

import type {
  SessionData,
  ValidateSessionResult,
} from "../models/Sessions/SessionInterface";
import SessionModel from "../models/Sessions/SessionModel";

class SessionStore {
  private useRedis: boolean = false;
  private sessionModel: SessionModel;

  constructor() {
    this.sessionModel = new SessionModel();
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      const context = RuntimeContext.getInstance();
      await context.ensureInitialized();
      const redisCache = context.getRedisCache();

      if (redisCache && redisCache.getStatus().connected) {
        this.useRedis = true;
        console.log("[SessionStore] Using Redis for session caching");
      } else {
        console.log("[SessionStore] Using database only (Redis not available)");
      }
    } catch (error) {
      console.warn(
        "[SessionStore] Failed to initialize Redis, using database only:",
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
   * Normalize cached session data (convert Date strings to Date objects)
   */
  private normalizeCachedSession(
    cached: ValidateSessionResult
  ): ValidateSessionResult {
    if (cached.valid && cached.session) {
      // Convert Date strings back to Date objects
      const session = {
        ...cached.session,
        expiresAt:
          cached.session.expiresAt instanceof Date
            ? cached.session.expiresAt
            : new Date(cached.session.expiresAt),
        createdAt:
          cached.session.createdAt instanceof Date
            ? cached.session.createdAt
            : new Date(cached.session.createdAt),
        updatedAt:
          cached.session.updatedAt instanceof Date
            ? cached.session.updatedAt
            : new Date(cached.session.updatedAt),
      };

      return {
        ...cached,
        session,
      };
    }

    return cached;
  }

  /**
   * Validate session token with Redis cache
   * Falls back to database if Redis is not available
   */
  async validateSession(
    sessionToken: string
  ): Promise<ValidateSessionResult> {
    // Try Redis cache first
    if (this.useRedis) {
      const cache = await this.getRedisCache();
      if (cache) {
        const cached = await cache.get<ValidateSessionResult>(sessionToken, {
          prefix: "session:",
        });

        if (cached !== CACHE_NOT_FOUND) {
          // Normalize Date objects
          const normalized = this.normalizeCachedSession(cached);

          // Check if session is still valid
          if (normalized.valid && normalized.session) {
            const now = Date.now();
            const expiresAt = normalized.session.expiresAt.getTime();

            if (now < expiresAt) {
              // Session is valid and not expired
              return normalized;
            } else {
              // Session expired, remove from cache
              await cache.delete(sessionToken, { prefix: "session:" });
            }
          } else {
            // Invalid session, return cached result
            return normalized;
          }
        }
      }
    }

    // Fallback to database
    const result = await this.sessionModel.validateSession(sessionToken);

    // Cache the result in Redis
    if (this.useRedis && result.valid) {
      const cache = await this.getRedisCache();
      if (cache && result.session) {
        const expiresAt = result.session.expiresAt.getTime();
        const now = Date.now();
        const ttl = Math.ceil((expiresAt - now) / 1000);

        if (ttl > 0) {
          await cache.set(sessionToken, result, {
            prefix: "session:",
            ttl,
          });
        }
      }
    }

    return result;
  }

  /**
   * Create session and cache it in Redis
   */
  async createSession(params: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
    expiresIn?: number;
  }): Promise<SessionData> {
    const session = await this.sessionModel.createSession(params);

    // Cache in Redis
    if (this.useRedis) {
      const cache = await this.getRedisCache();
      if (cache) {
        const expiresAt = session.expiresAt.getTime();
        const now = Date.now();
        const ttl = Math.ceil((expiresAt - now) / 1000);

        if (ttl > 0) {
          const cacheData: ValidateSessionResult = {
            valid: true,
            session,
            user: undefined, // Will be loaded on validation
          };
          await cache.set(session.sessionToken, cacheData, {
            prefix: "session:",
            ttl,
          });
        }
      }
    }

    return session;
  }

  /**
   * Destroy session from both database and Redis
   */
  async destroySession(sessionToken: string): Promise<boolean> {
    // Remove from Redis cache
    if (this.useRedis) {
      const cache = await this.getRedisCache();
      if (cache) {
        await cache.delete(sessionToken, { prefix: "session:" });
      }
    }

    // Remove from database
    return await this.sessionModel.destroySession(sessionToken);
  }

  /**
   * Destroy all sessions for a user
   */
  async destroyAllUserSessions(userId: string): Promise<number> {
    // Note: Redis cleanup by pattern would be expensive
    // For now, we'll just clear from database
    // Redis entries will expire naturally
    return await this.sessionModel.destroyAllUserSessions(userId);
  }

  /**
   * Extend session expiration
   */
  async extendSession(
    sessionToken: string,
    expiresIn?: number
  ): Promise<boolean> {
    const success = await this.sessionModel.extendSession(
      sessionToken,
      expiresIn
    );

    if (success && this.useRedis) {
      // Update cache with new expiration
      const cache = await this.getRedisCache();
      if (cache) {
        const cached = await cache.get<ValidateSessionResult>(sessionToken, {
          prefix: "session:",
        });

        if (cached !== CACHE_NOT_FOUND && cached.valid && cached.session) {
          // Re-validate to get updated session data
          const updated = await this.sessionModel.validateSession(sessionToken);
          if (updated.valid && updated.session) {
            const expiresAt = updated.session.expiresAt.getTime();
            const now = Date.now();
            const ttl = Math.ceil((expiresAt - now) / 1000);

            if (ttl > 0) {
              // Cache the updated session
              await cache.set(sessionToken, updated, {
                prefix: "session:",
                ttl,
              });
            }
          }
        } else {
          // Cache not found or invalid, re-validate and cache
          const updated = await this.sessionModel.validateSession(sessionToken);
          if (updated.valid && updated.session) {
            const expiresAt = updated.session.expiresAt.getTime();
            const now = Date.now();
            const ttl = Math.ceil((expiresAt - now) / 1000);

            if (ttl > 0) {
              await cache.set(sessionToken, updated, {
                prefix: "session:",
                ttl,
              });
            }
          }
        }
      }
    }

    return success;
  }

  /**
   * Invalidate session in cache (force re-validation from database)
   */
  async invalidateCache(sessionToken: string): Promise<void> {
    if (this.useRedis) {
      const cache = await this.getRedisCache();
      if (cache) {
        await cache.delete(sessionToken, { prefix: "session:" });
      }
    }
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();

// Export class for testing
export { SessionStore };

