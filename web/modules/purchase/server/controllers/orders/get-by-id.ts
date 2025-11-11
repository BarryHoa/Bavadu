import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type PurchaseOrderModel from "../../../server/models/Purchase";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "id query parameter is required" },
        { status: 400 }
      );
    }

    const result = await purchaseModel.getById(id);
    if (!result) {
      return NextResponse.json(
        { success: false, message: "Purchase order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch purchase order";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

