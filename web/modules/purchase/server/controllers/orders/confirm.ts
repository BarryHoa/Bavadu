import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type PurchaseOrderModel from "../../../server/models/Purchase";

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
    const purchaseModel = env.getModel(
      "purchase.order"
    ) as PurchaseOrderModel | undefined;

    if (!purchaseModel) {
      return NextResponse.json(
        { success: false, message: "Purchase model not available" },
        { status: 500 }
      );
    }

    const result = await purchaseModel.confirm(orderId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to confirm purchase order";
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

