import { randomBytes } from "crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { table_session } from "../../schemas/session";
import { table_user, table_user_login } from "../../schemas/user";
import { BaseModel } from "../BaseModel";
import type {
  CreateSessionParams,
  SessionData,
  ValidateSessionResult,
} from "./SessionInterface";

class SessionModel extends BaseModel<typeof table_session> {
  constructor() {
    super(table_session);
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

    const db = this.getDb();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresIn);
    const sessionToken = this.generateSessionToken();

    // Check if user exists
    const [user] = await db
      .select({ id: table_user.id })
      .from(table_user)
      .where(eq(table_user.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    const [session] = await db
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
    const db = this.getDb();
    const now = new Date();

    const [session] = await db
      .select({
        session: this.table,
        user: table_user,
        userLogin: table_user_login,
      })
      .from(this.table)
      .innerJoin(table_user, eq(this.table.userId, table_user.id))
      .leftJoin(table_user_login, eq(table_user.id, table_user_login.userId))
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

    // Update last access time
    await db
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
    const db = this.getDb();

    const result = await db
      .delete(this.table)
      .where(eq(this.table.sessionToken, sessionToken));

    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Destroy all sessions for a user
   */
  async destroyAllUserSessions(userId: string): Promise<number> {
    const db = this.getDb();

    const result = await db
      .delete(this.table)
      .where(eq(this.table.userId, userId));

    return result.rowCount || 0;
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const db = this.getDb();
    const now = new Date();

    // Delete sessions where expiresAt < now (expired)
    const result = await db
      .delete(this.table)
      .where(lt(this.table.expiresAt, now));

    return result.rowCount || 0;
  }

  /**
   * Extend session expiration
   */
  async extendSession(
    sessionToken: string,
    expiresIn?: number
  ): Promise<boolean> {
    const db = this.getDb();
    const now = new Date();
    const newExpiresAt = new Date(
      now.getTime() + (expiresIn || 7 * 24 * 60 * 60 * 1000)
    );

    const result = await db
      .update(this.table)
      .set({
        expiresAt: newExpiresAt,
        updatedAt: now,
      })
      .where(eq(this.table.sessionToken, sessionToken));

    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Get database instance (not from env)
   * Directly access from global runtime variables
   * This avoids dependency on env injection
   */
  private getDb() {
    // Access system runtime variables directly (same pattern as getEnv but without export)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const systemRuntimeVariables = (globalThis as any).systemRuntimeVariables;

    if (!systemRuntimeVariables?.env) {
      throw new Error("Database not initialized");
    }

    const db = systemRuntimeVariables.env.getDb();
    if (!db) {
      throw new Error("Database not initialized");
    }

    return db;
  }
}

export default SessionModel;
