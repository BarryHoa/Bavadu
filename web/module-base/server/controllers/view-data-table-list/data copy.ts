import getEnv from "@base/server/env";
import { NextRequest, NextResponse } from "next/server";

// Example edge handler for /view-list-data-table/data route (GET)
export async function POST(request: NextRequest) {
  // get body and validate
  const body = await request.json();
  console.log("body", body);
  return NextResponse.json({ success: true, data: body }, { status: 200 });
  const { modelId, params } = body ?? {};
  if (!modelId || typeof modelId !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid modelId" },
      { status: 400 }
    );
  }

  console.log("body", body);
  console.log("modelId", modelId);
  console.log("params", params);

  const env = getEnv();

  // Try to get model from registry first
  let modelInstance = env.getModel(modelId);

  if (!modelInstance) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }
  // check if modelInstance has getDefaultParamsForList method
  if (typeof modelInstance.getViewDataList !== "function") {
    return NextResponse.json(
      { error: "Model does not implement getViewDataList" },
      { status: 500 }
    );
  }
  try {
    const result = await modelInstance.getViewDataList(params);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get view data list" },
      { status: 500 }
    );
  }
}
