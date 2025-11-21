import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const productId = String(payload.productId ?? "").trim();
    const sourceWarehouseId = String(payload.sourceWarehouseId ?? "").trim();
    const targetWarehouseId = String(payload.targetWarehouseId ?? "").trim();
    const quantity = Number(payload.quantity ?? 0);

    if (
      !productId ||
      !sourceWarehouseId ||
      !targetWarehouseId ||
      quantity <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "productId, sourceWarehouseId, targetWarehouseId and a positive quantity are required for transfer",
        },
        { status: 400 }
      );
    }

    const response = await getModuleQueryByModel({
      model: "stock",
      modelMethod: "transferStock",
      params: {
        productId,
        sourceWarehouseId,
        targetWarehouseId,
        quantity,
        reference: payload.reference ? String(payload.reference) : undefined,
        note: payload.note ? String(payload.note) : undefined,
        userId: payload.userId ? String(payload.userId) : undefined,
      },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to transfer stock";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
