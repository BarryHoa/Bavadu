import { NextRequest, NextResponse } from "next/server";

// Example edge handler for /view-list-data-table/data route (GET)
export async function POST(request: NextRequest) {
  // get body and validate
  console.log("request", request);
  const body = await request.json();
  // const { modelId, params } = body;
  // if (!modelId) {
  //   return NextResponse.json(
  //     { error: "Model ID is required" },
  //     { status: 400 }
  //   );
  // }
  // if (!params) {
  //   return NextResponse.json({ error: "Params are required" }, { status: 400 });
  // }
  return NextResponse.json(
    { success: true, data: "Hello World" },
    { status: 200 }
  );
}
