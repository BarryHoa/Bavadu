import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import SessionModel from "../../models/Sessions/SessionModel";
import { table_user, table_user_login } from "../../schemas/user";
import getEnv from "../../utils/getEnv";

interface LoginRequest {
  username?: string;
  email?: string;
  phone?: string;
  password: string;
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
    const { username, email, phone, password } = body;

    // Validate input
    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    if (!username && !email && !phone) {
      return NextResponse.json(
        { success: false, error: "Username, email, or phone is required" },
        { status: 400 }
      );
    }

    const db = getEnv().getDb();

    // Find user login by username, email, or phone
    let userLogin;
    if (username) {
      [userLogin] = await db
        .select()
        .from(table_user_login)
        .where(eq(table_user_login.username, username))
        .limit(1);
    } else if (email) {
      [userLogin] = await db
        .select()
        .from(table_user_login)
        .where(eq(table_user_login.email, email))
        .limit(1);
    } else if (phone) {
      [userLogin] = await db
        .select()
        .from(table_user_login)
        .where(eq(table_user_login.phone, phone))
        .limit(1);
    }

    if (!userLogin) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await compare(password, userLogin.passwordHash);
    if (!passwordValid) {
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
    const session = await sessionModel.createSession({
      userId: user.id,
      ipAddress,
      userAgent,
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
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set("session_token", session.sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

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
