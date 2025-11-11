import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type SalesOrderModel from "../../../server/models/Sale";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const orderId = String(payload.orderId ?? "").trim();
    const lines = Array.isArray(payload.lines) ? payload.lines : [];

    if (!orderId || lines.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "orderId and at least one delivery line are required",
        },
        { status: 400 }
      );
    }

    const env = getEnv();
    const salesModel = env.getModel("sale.order") as SalesOrderModel | undefined;

    if (!salesModel) {
      return NextResponse.json(
        { success: false, message: "Sales model not available" },
        { status: 500 }
      );
    }

    const result = await salesModel.deliver({
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
      error instanceof Error ? error.message : "Failed to deliver sales order";
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

