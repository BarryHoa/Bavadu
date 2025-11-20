import { randomBytes } from "crypto";
import { eq, and, gt } from "drizzle-orm";
import getEnv from "../utils/getEnv";
import { table_session } from "../schemas/session";
import { table_user, table_user_login } from "../schemas/user";

export interface SessionData {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionParams {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresIn?: number; // milliseconds, default 7 days
}

export interface ValidateSessionResult {
  valid: boolean;
  session?: SessionData;
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
}

/**
 * Generate a secure random session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Create a new session for a user
 */
export async function createSession(
  params: CreateSessionParams
): Promise<SessionData> {
  const { userId, ipAddress, userAgent, expiresIn = 7 * 24 * 60 * 60 * 1000 } =
    params;

  const db = getEnv().getDb();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresIn);
  const sessionToken = generateSessionToken();

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
    .insert(table_session)
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
export async function validateSession(
  sessionToken: string
): Promise<ValidateSessionResult> {
  const db = getEnv().getDb();
  const now = new Date();

  const [session] = await db
    .select({
      session: table_session,
      user: table_user,
      userLogin: table_user_login,
    })
    .from(table_session)
    .innerJoin(table_user, eq(table_session.userId, table_user.id))
    .leftJoin(table_user_login, eq(table_user.id, table_user_login.userId))
    .where(
      and(
        eq(table_session.sessionToken, sessionToken),
        gt(table_session.expiresAt, now)
      )
    )
    .limit(1);

  if (!session) {
    return { valid: false };
  }

  // Update last access time
  await db
    .update(table_session)
    .set({ updatedAt: now })
    .where(eq(table_session.id, session.session.id));

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
export async function destroySession(sessionToken: string): Promise<boolean> {
  const db = getEnv().getDb();

  const result = await db
    .delete(table_session)
    .where(eq(table_session.sessionToken, sessionToken));

  return result.rowCount ? result.rowCount > 0 : false;
}

/**
 * Destroy all sessions for a user
 */
export async function destroyAllUserSessions(userId: string): Promise<number> {
  const db = getEnv().getDb();

  const result = await db
    .delete(table_session)
    .where(eq(table_session.userId, userId));

  return result.rowCount || 0;
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const db = getEnv().getDb();
  const now = new Date();

  const result = await db
    .delete(table_session)
    .where(gt(now, table_session.expiresAt));

  return result.rowCount || 0;
}

/**
 * Extend session expiration
 */
export async function extendSession(
  sessionToken: string,
  expiresIn?: number
): Promise<boolean> {
  const db = getEnv().getDb();
  const now = new Date();
  const newExpiresAt = new Date(
    now.getTime() + (expiresIn || 7 * 24 * 60 * 60 * 1000)
  );

  const result = await db
    .update(table_session)
    .set({
      expiresAt: newExpiresAt,
      updatedAt: now,
    })
    .where(eq(table_session.sessionToken, sessionToken));

  return result.rowCount ? result.rowCount > 0 : false;
}

