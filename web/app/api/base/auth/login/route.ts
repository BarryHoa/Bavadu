import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password: _password } = body;

    // TODO: Implement actual login logic with database
    // For now, return a mock response
    const secret = process.env.JWT_SECRET || "your-super-secret-jwt-key-here";
    const token = jwt.sign({ email, userId: "mock-user-id" }, secret, {
      expiresIn: "24h",
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          email,
          id: "mock-user-id",
        },
      },
    });
  } catch (error) {
    // Log error for debugging (in production, use proper logging service)
    if (process.env.NODE_ENV === "development") {
      console.error("Login error:", error);
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
