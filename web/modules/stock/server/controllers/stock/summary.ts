import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  return getModuleQueryByModel({
    model: "stock.summary.view-list",
    modelMethod: "getData",
    params: {
      offset: 0,
      limit: 1000,
      filters: {
        productId: searchParams.get("productId") ?? undefined,
        warehouseId: searchParams.get("warehouseId") ?? undefined,
      },
    },
  });
}
