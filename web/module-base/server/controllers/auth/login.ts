import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_CONFIG } from "../../config";
import { setCsrfTokenCookie } from "../../middleware/csrf";
import SessionModel from "../../models/Sessions/SessionModel";
import { table_user, table_user_login } from "../../schemas/user";
import getDbConnect from "../../utils/getDbConnect";

interface LoginRequest {
  username?: string;
  email?: string;
  phone?: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

/**
 * Get user agent from request
 */
function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password, rememberMe = false } = body;

    // Validate input
    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { success: false, error: "Username, email, or phone is required" },
        { status: 400 }
      );
    }

    const db = getDbConnect();

    // Find user login by username, email, or phone in parallel
    const queries = [];

    if (username) {
      queries.push(
        db
          .select()
          .from(table_user_login)
          .where(eq(table_user_login.username, username))
          .limit(1)
          .then((result) => result[0] || null)
      );
      queries.push(
        db
          .select()
          .from(table_user_login)
          .where(eq(table_user_login.email, username))
          .limit(1)
          .then((result) => result[0] || null)
      );
      queries.push(
        db
          .select()
          .from(table_user_login)
          .where(eq(table_user_login.phone, username))
          .limit(1)
          .then((result) => result[0] || null)
      );
    }

    // Execute all queries in parallel and get the first non-null result
    const results = await Promise.all(queries);
    const userLogin = results.find((user) => user !== null);

    if (!userLogin) {
      console.error("Login: User not found", { username });
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password

    const passwordValid = await compare(password, userLogin.passwordHash);
    if (!passwordValid) {
      console.error("Login: Password mismatch", {
        email: userLogin.email,
        username: userLogin.username,
      });
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Get user info
    const [user] = await db
      .select()
      .from(table_user)
      .where(eq(table_user.id, userLogin.userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is active

    if (user.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Account is not active" },
        { status: 403 }
      );
    }

    // Create session
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);
    const sessionModel = new SessionModel();

    // Set session expiration: 30 days if remember me, 7 days otherwise
    const expiresIn = rememberMe
      ? SESSION_CONFIG.expiration.rememberMe
      : SESSION_CONFIG.expiration.default;

    const session = await sessionModel.createSession({
      userId: user.id,
      ipAddress,
      userAgent,
      expiresIn,
    });

    // Update last login info
    const now = new Date();
    await db
      .update(table_user_login)
      .set({
        lastLoginAt: now,
        lastLoginIp: ipAddress,
        lastLoginUserAgent: userAgent,
        updatedAt: now,
      })
      .where(eq(table_user_login.userId, user.id));

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: userLogin.username,
          avatar: user.avatar,
        },
      },
    });

    // Set session cookie
    const cookieMaxAge = rememberMe
      ? SESSION_CONFIG.cookie.maxAge.rememberMe
      : SESSION_CONFIG.cookie.maxAge.default;

    response.cookies.set(SESSION_CONFIG.cookie.name, session.sessionToken, {
      httpOnly: SESSION_CONFIG.cookie.httpOnly,
      secure: SESSION_CONFIG.cookie.secure,
      sameSite: SESSION_CONFIG.cookie.sameSite,
      maxAge: cookieMaxAge,
      path: SESSION_CONFIG.cookie.path,
    });

    // Set CSRF token cookie after successful login
    setCsrfTokenCookie(response);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Login failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
