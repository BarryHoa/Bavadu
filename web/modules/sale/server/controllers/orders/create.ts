import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type SalesOrderModel from "../../../server/models/Sale";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const env = getEnv();
    const salesModel = env.getModel("sale.order") as SalesOrderModel | undefined;

    if (!salesModel) {
      return NextResponse.json(
        { success: false, message: "Sales model not available" },
        { status: 500 }
      );
    }

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

    const result = await salesModel.create({
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
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create sales order";
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

