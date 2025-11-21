import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { NextRequest, NextResponse } from "next/server";

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

    const response = await getModuleQueryByModel({
      model: "stock",
      modelMethod: "adjustStock",
      params: {
        productId,
        warehouseId,
        quantityDelta,
        reference: payload.reference ? String(payload.reference) : undefined,
        note: payload.note ? String(payload.note) : undefined,
        userId: payload.userId ? String(payload.userId) : undefined,
      },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to adjust stock";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
