import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password: _password } = body;

    // TODO: Implement actual registration logic with database
    // For now, return a mock response
    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          username,
          email,
          id: "mock-user-id",
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
