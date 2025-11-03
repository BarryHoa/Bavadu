import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Đọc body - Fastify không parse nữa, Next.js tự parse
    const body = await request.json();
    console.log("body", body);

    // Extract modelId
    const { modelId } = body;

    // Validate
    // if (!modelId) {
    //   return NextResponse.json(
    //     { error: "Model ID is required" },
    //     { status: 400 }
    //   );
    // }

    return NextResponse.json(
      { success: true, data: "Hello World", body },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
