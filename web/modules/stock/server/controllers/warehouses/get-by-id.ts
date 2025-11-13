import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type StockModel from "../../../server/models/Stock";
import { serializeWarehouse } from "./utils";

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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Warehouse id is required" },
        { status: 400 }
      );
    }

    const warehouse = await stockModel.getWarehouse(id);

    if (!warehouse) {
      return NextResponse.json(
        { success: false, message: "Warehouse not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: serializeWarehouse(warehouse),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch warehouse";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

