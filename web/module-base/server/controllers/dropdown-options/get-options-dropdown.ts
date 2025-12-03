import { NextRequest } from "next/server";
import getModuleQueryByModel from "../../utils/getModuleQueryByModel";
import { validateModelName } from "../../validation/validateModelName";

// Example edge handler for /view-list-data-table/data route (GET)
export async function POST(request: NextRequest) {
  // get body and validate
  const body = await request.json();

  const { model, params } = body ?? {};

  // validate model name
  await validateModelName(model, "dropdown-list");

  return await getModuleQueryByModel({
    model,
    modelMethod: "getData",
    params,
  });
}
