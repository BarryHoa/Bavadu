import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type WarehouseModel from "../../../server/models/Warehouse";
import { serializeWarehouse } from "./utils";

export async function GET(_request: NextRequest) {
  try {
    const env = getEnv();
    const warehouseModel = env.getModel("stock.warehouse") as
      | WarehouseModel
      | undefined;

    if (!warehouseModel) {
      return NextResponse.json(
        { success: false, message: "Stock model not available" },
        { status: 500 }
      );
    }

    const warehouses = await warehouseModel.listWarehouses();
    return NextResponse.json({
      success: true,
      data: warehouses.map(serializeWarehouse),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch warehouses";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
