import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type SalesOrderModel from "../../../server/models/Sale";

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

    const env = getEnv();
    const salesModel = env.getModel("sale.order") as SalesOrderModel | undefined;

    if (!salesModel) {
      return NextResponse.json(
        { success: false, message: "Sales model not available" },
        { status: 500 }
      );
    }

    const result = await salesModel.confirm(orderId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to confirm sales order";
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

