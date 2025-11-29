import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const { vendorName, lines } = payload;
    if (!vendorName || !Array.isArray(lines) || lines.length === 0) {
      return JSONResponse({
        message: "vendorName and at least one line are required",
        status: 400,
      });
    }

    const response = await getModuleQueryByModel({
      model: "purchase.order",
      modelMethod: "create",
      params: {
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
      },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create purchase order";
    return JSONResponse({ message, status: 400 });
  }
}
