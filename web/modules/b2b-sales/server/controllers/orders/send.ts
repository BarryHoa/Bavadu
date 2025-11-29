import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const orderId = String(payload.orderId ?? "").trim();

    if (!orderId) {
      return JSONResponse({
        message: "orderId is required",
        status: 400,
      });
    }

    const response = await getModuleQueryByModel({
      model: "sale.orderB2B",
      modelMethod: "send",
      params: { orderId },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send B2B sales order";
    return JSONResponse({ message, status: 400 });
  }
}

