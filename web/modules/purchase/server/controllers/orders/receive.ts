import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type PurchaseOrderModel from "../../../server/models/Purchase";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const orderId = String(payload.orderId ?? "").trim();
    const lines = Array.isArray(payload.lines) ? payload.lines : [];

    if (!orderId || lines.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "orderId and at least one received line are required",
        },
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

    const result = await purchaseModel.receive({
      orderId,
      warehouseId: payload.warehouseId ?? undefined,
      reference: payload.reference ?? undefined,
      note: payload.note ?? undefined,
      userId: payload.userId ?? undefined,
      lines: lines.map((line: any) => ({
        lineId: String(line.lineId),
        quantity: Number(line.quantity ?? 0),
      })),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to receive purchase order";
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

