import type {
  CreateSessionParams,
  SessionData,
  ValidateSessionResult,
} from "./SessionInterface";

import { randomBytes } from "crypto";

import { and, eq, gt, lt } from "drizzle-orm";

import { Debug } from "../../runtime/Debug";
import { base_tb_sessions } from "../../schemas/base.session";
import { base_tb_users, base_tb_users_login } from "../../schemas/base.user";
import BaseModelCached from "../BaseModelCached";

class SessionModel extends BaseModelCached<
  typeof base_tb_sessions,
  ValidateSessionResult
> {
  private readonly useRedis: boolean;
  protected cachePrefix = "session:";

  constructor() {
    super(base_tb_sessions);
    this.useRedis = this.shouldUseRedis();
    if (this.useRedis) {
      Debug.log("[SessionModel] Using Redis for session caching");
    }
  }

  private shouldUseRedis(): boolean {
    try {
      const redisCache = this.getCache();

      return redisCache?.getStatus().connected ?? false;
    } catch {
      return false;
    }
  }

  private normalizeCachedSession(
    cached: ValidateSessionResult
  ): ValidateSessionResult {
    if (cached.valid && cached.session) {
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

  private async cacheSession(
    sessionToken: string,
    result: ValidateSessionResult
  ): Promise<void> {
    if (!this.useRedis || !result.valid || !result.session) {
      return;
    }

    const expiresAt = result.session.expiresAt.getTime();
    const now = Date.now();
    const ttl = Math.ceil((expiresAt - now) / 1000);

    if (ttl > 0) {
      await this.cacheSet(result, sessionToken, { ttl });
    }
  }

  private async invalidateCache(sessionToken: string): Promise<void> {
    if (!this.useRedis) {
      return;
    }

    await this.cacheDelete(sessionToken);
  }

  /**
   * Generate a secure random session token
   */
  generateSessionToken(): string {
    return randomBytes(32).toString("hex");
  }

  /**
   * Create a new session for a user
   */
  async createSession(params: CreateSessionParams): Promise<SessionData> {
    const {
      userId,
      ipAddress,
      userAgent,
      expiresIn = 7 * 24 * 60 * 60 * 1000, // 7 days default
    } = params;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresIn);
    const sessionToken = this.generateSessionToken();

    const [session] = await this.db
      .insert(this.table)
      .values({
        userId,
        sessionToken,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!session) {
      throw new Error("Failed to create session");
    }

    const sessionData: SessionData = {
      id: session.id,
      userId: session.userId,
      sessionToken: session.sessionToken,
      expiresAt: session.expiresAt!,
      createdAt: session.createdAt!,
      updatedAt: session.updatedAt!,
    };

    // Cache in Redis
    await this.cacheSession(sessionToken, {
      valid: true,
      session: sessionData,
    });

    return sessionData;
  }

  /**
   * Validate a session token and return session data with user info
   * Checks Redis cache first, falls back to database if not found
   */
  async validateSession(sessionToken: string): Promise<ValidateSessionResult> {
    // Try Redis cache first
    if (this.useRedis) {
      const cached =
        await this.cacheGet<ValidateSessionResult>(sessionToken);

      if (cached !== this.CACHE_NOT_FOUND) {
        const normalized = this.normalizeCachedSession(
          cached as ValidateSessionResult,
        );

        if (normalized.valid && normalized.session) {
          const now = Date.now();
          const expiresAt = normalized.session.expiresAt.getTime();

          if (now < expiresAt) {
            // Session is valid and not expired
            return normalized;
          } else {
            // Session expired, remove from cache
            await this.invalidateCache(sessionToken);
          }
        } else {
          // Invalid session, return cached result
          return normalized;
        }
      }
    }

    // Fallback to database
    const result = await this._validateSessionFromDB(sessionToken);

    // Cache the result if valid
    if (result.valid) {
      await this.cacheSession(sessionToken, result);
    }

    return result;
  }

  /**
   * Validate session from database (private method)
   */
  private async _validateSessionFromDB(
    sessionToken: string
  ): Promise<ValidateSessionResult> {
    const now = new Date();

    const [session] = await this.db
      .select({
        session: this.table,
        user: base_tb_users,
        userLogin: base_tb_users_login,
      })
      .from(this.table)
      .innerJoin(base_tb_users, eq(this.table.userId, base_tb_users.id))
      .leftJoin(
        base_tb_users_login,
        eq(base_tb_users.id, base_tb_users_login.userId),
      )
      .where(
        and(
          eq(this.table.sessionToken, sessionToken),
          gt(this.table.expiresAt, now),
        ),
      )
      .limit(1);

    if (!session) {
      return { valid: false };
    }

    // Ensure user is still active; if not, treat session as invalid
    if (session.user.status !== "active") {
      return { valid: false };
    }

    // Update last access time
    await this.db
      .update(this.table)
      .set({ updatedAt: now })
      .where(eq(this.table.id, session.session.id));

    return {
      valid: true,
      session: {
        id: session.session.id,
        userId: session.session.userId,
        sessionToken: session.session.sessionToken,
        expiresAt: session.session.expiresAt!,
        createdAt: session.session.createdAt!,
        updatedAt: now,
      },
      user: {
        id: session.user.id,
        username: session.userLogin?.username || session.user.id,
        avatar: session.user.avatar || undefined,
      },
    };
  }

  /**
   * Destroy a session by token
   */
  async destroySession(sessionToken: string): Promise<boolean> {
    // Remove from Redis cache
    await this.invalidateCache(sessionToken);

    // Remove from database
    const result = await this.db
      .delete(this.table)
      .where(eq(this.table.sessionToken, sessionToken))
      .returning();

    return result.length > 0;
  }

  /**
   * Destroy all sessions for a user
   */
  async destroyAllUserSessions(userId: string): Promise<number> {
    const result = await this.db
      .delete(this.table)
      .where(eq(this.table.userId, userId))
      .returning();

    return result.length;
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();

    // Delete sessions where expiresAt < now (expired)
    const result = await this.db
      .delete(this.table)
      .where(lt(this.table.expiresAt, now))
      .returning();

    return result.length;
  }

  /**
   * Extend session expiration
   */
  async extendSession(
    sessionToken: string,
    expiresIn?: number,
  ): Promise<boolean> {
    const now = new Date();
    const newExpiresAt = new Date(
      now.getTime() + (expiresIn || 7 * 24 * 60 * 60 * 1000),
    );

    const result = await this.db
      .update(this.table)
      .set({
        expiresAt: newExpiresAt,
        updatedAt: now,
      })
      .where(eq(this.table.sessionToken, sessionToken))
      .returning();

    const success = result.length > 0;

    // Update cache if successful
    if (success) {
      const updated = await this._validateSessionFromDB(sessionToken);

      if (updated.valid) {
        await this.cacheSession(sessionToken, updated);
      }
    }

    return success;
  }
}

export default SessionModel;
