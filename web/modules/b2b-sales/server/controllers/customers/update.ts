import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const payload = await request.json();

    const { id } = payload;
    if (!id) {
      return JSONResponse({
        message: "id is required",
        status: 400,
      });
    }

    const response = await getModuleQueryByModel({
      model: "sale.customer",
      modelMethod: "updateCompany",
      params: payload,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update customer company";
    return JSONResponse({ message, status: 400 });
  }
}

