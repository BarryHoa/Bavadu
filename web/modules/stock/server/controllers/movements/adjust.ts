import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type StockModel from "../../../server/models/Stock";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const productId = String(payload.productId ?? "").trim();
    const warehouseId = String(payload.warehouseId ?? "").trim();
    const quantityDelta = Number(payload.quantityDelta ?? 0);

    if (!productId || !warehouseId || Number.isNaN(quantityDelta)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "productId, warehouseId and quantityDelta are required for stock adjustment",
        },
        { status: 400 }
      );
    }

    const env = getEnv();
    const stockModel = env.getModel("stock") as StockModel | undefined;

    if (!stockModel) {
      return NextResponse.json(
        { success: false, message: "Stock model not available" },
        { status: 500 }
      );
    }

    const move = await stockModel.adjustStock({
      productId,
      warehouseId,
      quantityDelta,
      reference: payload.reference ? String(payload.reference) : undefined,
      note: payload.note ? String(payload.note) : undefined,
      userId: payload.userId ? String(payload.userId) : undefined,
    });

    return NextResponse.json({ success: true, data: move }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to adjust stock";
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

