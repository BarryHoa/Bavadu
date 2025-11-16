import { NextRequest, NextResponse } from "next/server";
import getModuleQueryByModel from "@/module-base/server/utils/getModuleQueryByModel";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const { customerName, lines } = payload;
    if (!customerName || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "customerName and at least one line are required",
        },
        { status: 400 }
      );
    }

    const response = await getModuleQueryByModel({
      model: "sale.order",
      modelMethod: "create",
      params: {
        code: payload.code,
        customerName: String(customerName),
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
      },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create sales order";
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

