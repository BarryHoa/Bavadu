import getModuleQueryByModel from "@/module-base/server/utils/getModuleQueryByModel";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  return getModuleQueryByModel({
    model: "stock",
    modelMethod: "getStockSummary",
    params: {
      productId: searchParams.get("productId") ?? undefined,
      warehouseId: searchParams.get("warehouseId") ?? undefined,
    },
  });
}
