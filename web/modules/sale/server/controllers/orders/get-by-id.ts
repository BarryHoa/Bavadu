import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type SalesOrderModel from "../../../server/models/Sale";

export async function GET(request: NextRequest) {
  try {
    const env = getEnv();
    const salesModel = env.getModel("sale.order") as SalesOrderModel | undefined;

    if (!salesModel) {
      return NextResponse.json(
        { success: false, message: "Sales model not available" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "id query parameter is required" },
        { status: 400 }
      );
    }

    const result = await salesModel.getById(id);
    if (!result) {
      return NextResponse.json(
        { success: false, message: "Sales order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch sales order";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

