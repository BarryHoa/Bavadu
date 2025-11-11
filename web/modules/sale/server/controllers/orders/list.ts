import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type SalesOrderModel from "../../../server/models/Sale";

export async function GET(_request: NextRequest) {
  try {
    const env = getEnv();
    const salesModel = env.getModel("sale.order") as SalesOrderModel | undefined;

    if (!salesModel) {
      return NextResponse.json(
        { success: false, message: "Sales model not available" },
        { status: 500 }
      );
    }

    const orders = await salesModel.list();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch sales orders";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

