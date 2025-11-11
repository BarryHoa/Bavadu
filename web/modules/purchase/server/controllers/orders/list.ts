import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type PurchaseOrderModel from "../../../server/models/Purchase";

export async function GET(_request: NextRequest) {
  try {
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

    const orders = await purchaseModel.list();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch purchase orders";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

