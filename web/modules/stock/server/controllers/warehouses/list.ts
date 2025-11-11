import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type StockModel from "../../../server/models/Stock";

export async function GET(_request: NextRequest) {
  try {
    const env = getEnv();
    const stockModel = env.getModel("stock") as StockModel | undefined;

    if (!stockModel) {
      return NextResponse.json(
        { success: false, message: "Stock model not available" },
        { status: 500 }
      );
    }

    const warehouses = await stockModel.listWarehouses();
    return NextResponse.json({ success: true, data: warehouses });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch warehouses";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
