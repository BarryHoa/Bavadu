
import { NextRequest, NextResponse } from "next/server";
import getEnv from "../../utils/getEnv";

// Example edge handler for /view-list-data-table/data route (GET)
export async function POST(request: NextRequest) {
  // get body and validate
  const body = await request.json();

  const { modelId, params } = body ?? {};
  if (!modelId || typeof modelId !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid modelId" },
      { status: 400 }
    );
  }



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
    console.error("Error in getViewDataList", error);
    return NextResponse.json(
      { error: "Failed to get view data list" },
      { status: 500 }
    );
  }
}
