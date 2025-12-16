import type {
  CreateSessionParams,
  SessionData,
  ValidateSessionResult,
} from "./SessionInterface";

import { randomBytes } from "crypto";

import { and, eq, gt, lt } from "drizzle-orm";

import { base_tb_sessions } from "../../schemas/base.session";
import { base_tb_users, base_tb_users_login } from "../../schemas/base.user";
import { BaseModel } from "../BaseModel";

class SessionModel extends BaseModel<typeof base_tb_sessions> {
  constructor() {
    super(base_tb_sessions);
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

    return {
      id: session.id,
      userId: session.userId,
      sessionToken: session.sessionToken,
      expiresAt: session.expiresAt!,
      createdAt: session.createdAt!,
      updatedAt: session.updatedAt!,
    };
  }

  /**
   * Validate a session token and return session data with user info
   */
  async validateSession(sessionToken: string): Promise<ValidateSessionResult> {
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
        eq(base_tb_users.id, base_tb_users_login.userId)
      )
      .where(
        and(
          eq(this.table.sessionToken, sessionToken),
          gt(this.table.expiresAt, now)
        )
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
    expiresIn?: number
  ): Promise<boolean> {
    const now = new Date();
    const newExpiresAt = new Date(
      now.getTime() + (expiresIn || 7 * 24 * 60 * 60 * 1000)
    );

    const result = await this.db
      .update(this.table)
      .set({
        expiresAt: newExpiresAt,
        updatedAt: now,
      })
      .where(eq(this.table.sessionToken, sessionToken))
      .returning();

    return result.length > 0;
  }
}

export default SessionModel;
