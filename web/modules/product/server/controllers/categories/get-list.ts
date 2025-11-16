import getModuleQueryByModel from "@/module-base/server/utils/getModuleQueryByModel";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const response = await getModuleQueryByModel({
    model: "product.category.list",
    modelMethod: "getData",
    params: {
      offset: 0,
      limit: 1000,
    },
  });

  return response;
}
