import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { SESSION_CONFIG } from "@base/server/config/session";
import { setCsrfTokenCookie } from "../../middleware/csrf";
import { RuntimeContext } from "../../runtime/RuntimeContext";
import { base_tb_users, base_tb_users_login } from "../../schemas/base.user";
import { sessionStore } from "../../stores";
import { JSONResponse } from "../../utils/JSONResponse";
import {
  getClientIp,
  getUserAgent,
  logAuthFailure,
  logAuthSuccess,
} from "../../utils/security-logger";

interface LoginRequest {
  username?: string;
  email?: string;
  phone?: string;
  password: string;
  rememberMe?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password, rememberMe = false } = body;

    // Validate input
    if (!password) {
      return JSONResponse({
        error: "Password is required",
        status: 400,
      });
    }

    if (!username) {
      return JSONResponse({
        error: "Username, email, or phone is required",
        status: 400,
      });
    }

    const db = await RuntimeContext.getDbConnect();

    // Find user login by username, email, or phone in parallel
    const queries = [];

    if (username) {
      queries.push(
        db
          .select()
          .from(base_tb_users_login)
          .where(eq(base_tb_users_login.username, username))
          .limit(1)
          .then((result) => result[0] || null)
      );
      queries.push(
        db
          .select()
          .from(base_tb_users_login)
          .where(eq(base_tb_users_login.email, username))
          .limit(1)
          .then((result) => result[0] || null)
      );
      queries.push(
        db
          .select()
          .from(base_tb_users_login)
          .where(eq(base_tb_users_login.phone, username))
          .limit(1)
          .then((result) => result[0] || null)
      );
    }

    // Execute all queries in parallel and get the first non-null result
    const results = await Promise.all(queries);
    const userLogin = results.find((user) => user !== null);

    if (!userLogin) {
      logAuthFailure("User not found", {
        ip: getClientIp(request),
        userAgent: getUserAgent(request),
        path: request.nextUrl.pathname,
        username,
      });

      return JSONResponse({
        error: "Invalid credentials",
        status: 401,
      });
    }

    // Verify password

    const passwordValid = await compare(password, userLogin.passwordHash);

    if (!passwordValid) {
      logAuthFailure("Password mismatch", {
        ip: getClientIp(request),
        userAgent: getUserAgent(request),
        path: request.nextUrl.pathname,
        username: userLogin.username || undefined,
        email: userLogin.email || undefined,
      });

      return JSONResponse({
        error: "Invalid credentials",
        status: 401,
      });
    }

    // Get user info
    const [user] = await db
      .select()
      .from(base_tb_users)
      .where(eq(base_tb_users.id, userLogin.userId))
      .limit(1);

    if (!user) {
      return JSONResponse({
        error: "User not found",
        status: 404,
      });
    }

    // Check if user is active

    if (user.status !== "active") {
      return JSONResponse({
        error: "Account is not active",
        status: 403,
      });
    }

    // Create session
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    // Set session expiration: 30 days if remember me, 7 days otherwise
    const expiresIn = rememberMe
      ? SESSION_CONFIG.expiration.rememberMe
      : SESSION_CONFIG.expiration.default;

    const session = await sessionStore.createSession({
      userId: user.id,
      ipAddress,
      userAgent,
      expiresIn,
    });

    // Update last login info
    const now = new Date();

    await db
      .update(base_tb_users_login)
      .set({
        lastLoginAt: now,
        lastLoginIp: ipAddress,
        lastLoginUserAgent: userAgent,
        updatedAt: now,
      })
      .where(eq(base_tb_users_login.userId, user.id));

    // Create response with session cookie
    const response = JSONResponse({
      data: {
        user: {
          id: user.id,
          username: userLogin.username,
          avatar: user.avatar,
        },
      },
      status: 200,
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

    // Log successful authentication
    logAuthSuccess({
      ip: ipAddress,
      userAgent,
      path: request.nextUrl.pathname,
      userId: user.id,
      username: userLogin.username || "unknown",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return JSONResponse({
      error: "Login failed",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
