import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type StockModel from "../../../server/models/Stock";

export async function GET(request: NextRequest) {
  try {
    const env = getEnv();
    const stockModel = env.getModel("stock") as StockModel | undefined;

    if (!stockModel) {
      return NextResponse.json(
        { success: false, message: "Stock model not available" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const summary = await stockModel.getStockSummary({
      productId: searchParams.get("productId") ?? undefined,
      warehouseId: searchParams.get("warehouseId") ?? undefined,
    });

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch stock summary";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
