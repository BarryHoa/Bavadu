import usersModel from "@serv/models/UsersModel";
import { GetUserListReq } from "@serv/models/interfaces/UserInterface";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const params: GetUserListReq = {
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : 0,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 10,
      search: searchParams.get("search") || undefined,
      filters: searchParams.get("filters")
        ? JSON.parse(searchParams.get("filters")!)
        : {},
      sorts: searchParams.get("sorts")
        ? JSON.parse(searchParams.get("sorts")!)
        : [],
    };

    const result = await usersModel.getUsers(params);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password: _password } = body;

    // TODO: Implement actual user creation logic
    // For now, return mock data
    const newUser = {
      id: Date.now(),
      username,
      email,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: { user: newUser },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
