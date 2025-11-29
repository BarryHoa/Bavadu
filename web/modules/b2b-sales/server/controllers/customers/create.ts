import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const { name } = payload;
    if (!name) {
      return JSONResponse({
        message: "name is required",
        status: 400,
      });
    }

    const response = await getModuleQueryByModel({
      model: "sale.customer",
      modelMethod: "createCompany",
      params: payload,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create customer company";
    return JSONResponse({ message, status: 400 });
  }
}

