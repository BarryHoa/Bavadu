import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const productId = String(payload.productId ?? "").trim();
    const warehouseId = String(payload.warehouseId ?? "").trim();
    const quantity = Number(payload.quantity ?? 0);

    if (!productId || !warehouseId || quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "productId, warehouseId and a positive quantity are required for outbound movement",
        },
        { status: 400 }
      );
    }

    const response = await getModuleQueryByModel({
      model: "stock",
      modelMethod: "issueStock",
      params: {
        productId,
        warehouseId,
        quantity,
        reference: payload.reference ? String(payload.reference) : undefined,
        note: payload.note ? String(payload.note) : undefined,
        userId: payload.userId ? String(payload.userId) : undefined,
      },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to register outbound stock";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
