import { NextRequest, NextResponse } from "next/server";
import getModuleQueryByModel from "@/module-base/server/utils/getModuleQueryByModel";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "id query parameter is required" },
        { status: 400 }
      );
    }

    const response = await getModuleQueryByModel({
      model: "purchase.order",
      modelMethod: "getById",
      params: { id },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch purchase order";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

