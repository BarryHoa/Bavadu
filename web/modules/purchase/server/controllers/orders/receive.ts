import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const orderId = String(payload.orderId ?? "").trim();
    const lines = Array.isArray(payload.lines) ? payload.lines : [];

    if (!orderId || lines.length === 0) {
      return JSONResponse({
        message: "orderId and at least one received line are required",
        status: 400,
      });
    }

    const response = await getModuleQueryByModel({
      model: "purchase.order",
      modelMethod: "receive",
      params: {
        orderId,
        warehouseId: payload.warehouseId ?? undefined,
        reference: payload.reference ?? undefined,
        note: payload.note ?? undefined,
        userId: payload.userId ?? undefined,
        lines: lines.map((line: any) => ({
          lineId: String(line.lineId),
          quantity: Number(line.quantity ?? 0),
        })),
      },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to receive purchase order";
    return JSONResponse({ message, status: 400 });
  }
}
