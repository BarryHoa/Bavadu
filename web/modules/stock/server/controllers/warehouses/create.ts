import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type StockModel from "../../../server/models/Stock";

export async function POST(request: NextRequest) {
  try {
    const env = getEnv();
    const stockModel = env.getModel("stock") as StockModel | undefined;

    if (!stockModel) {
      return NextResponse.json(
        { success: false, message: "Stock model not available" },
        { status: 500 }
      );
    }

    const payload = await request.json();
    const record = await stockModel.createWarehouse({
      code: String(payload.code ?? "").trim(),
      name: String(payload.name ?? "").trim(),
      description: payload.description
        ? String(payload.description)
        : undefined,
      isActive:
        typeof payload.isActive === "boolean" ? payload.isActive : undefined,
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create warehouse";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
