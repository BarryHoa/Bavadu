import { NextRequest } from "next/server";
import getModuleQueryByModel from "../../utils/getModuleQueryByModel";

// Example edge handler for /view-list-data-table/data route (GET)
export async function POST(request: NextRequest) {
  // get body and validate
  const body = await request.json();

  const { model, params } = body ?? {};

  return await getModuleQueryByModel({
    model,
    modelMethod: "getViewDataList",
    params,
  });
}
