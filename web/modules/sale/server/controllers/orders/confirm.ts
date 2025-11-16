import { NextRequest, NextResponse } from "next/server";
import getModuleQueryByModel from "@/module-base/server/utils/getModuleQueryByModel";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const orderId = String(payload.orderId ?? "").trim();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId is required" },
        { status: 400 }
      );
    }

    const response = await getModuleQueryByModel({
      model: "sale.order",
      modelMethod: "confirm",
      params: { orderId },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to confirm sales order";
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

