import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const { orderType, orderId, warehouseId, deliveryDate, lines } = payload;
    if (
      !orderType ||
      !orderId ||
      !warehouseId ||
      !deliveryDate ||
      !Array.isArray(lines) ||
      lines.length === 0
    ) {
      return JSONResponse({
        message:
          "orderType, orderId, warehouseId, deliveryDate, and at least one line are required",
        status: 400,
      });
    }

    if (orderType !== "B2B" && orderType !== "B2C") {
      return JSONResponse({
        message: "orderType must be 'B2B' or 'B2C'",
        status: 400,
      });
    }

    const response = await getModuleQueryByModel({
      model: "sale.delivery",
      modelMethod: "create",
      params: {
        orderType: String(orderType),
        orderId: String(orderId),
        warehouseId: String(warehouseId),
        deliveryDate: String(deliveryDate),
        reference: payload.reference,
        note: payload.note,
        userId: payload.userId,
        lines: lines.map((line: any) => ({
          lineId: String(line.lineId),
          quantity: Number(line.quantity ?? 0),
        })),
      },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create delivery";
    return JSONResponse({ message, status: 400 });
  }
}

