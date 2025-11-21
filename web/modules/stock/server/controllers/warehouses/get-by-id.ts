import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Warehouse id is required" },
        { status: 400 }
      );
    }

    const response = await getModuleQueryByModel({
      model: "stock.warehouse",
      modelMethod: "getWarehouse",
      params: { id },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch warehouse";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
