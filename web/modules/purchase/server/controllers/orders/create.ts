import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type PurchaseOrderModel from "../../../server/models/Purchase";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

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

    const { vendorName, lines } = payload;
    if (!vendorName || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "vendorName and at least one line are required",
        },
        { status: 400 }
      );
    }

    const result = await purchaseModel.create({
      code: payload.code,
      vendorName: String(vendorName),
      warehouseId: payload.warehouseId ?? undefined,
      expectedDate: payload.expectedDate ?? undefined,
      currency: payload.currency ?? undefined,
      notes: payload.notes ?? undefined,
      userId: payload.userId ?? undefined,
      lines: lines.map((line: any) => ({
        productId: String(line.productId),
        quantity: Number(line.quantity ?? 0),
        unitPrice: Number(line.unitPrice ?? 0),
        description: line.description ? String(line.description) : undefined,
      })),
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create purchase order";
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

