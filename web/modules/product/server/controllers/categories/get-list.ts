import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const response = await getModuleQueryByModel({
    model: "list.product.category",
    modelMethod: "getData",
    params: {
      offset: 0,
      limit: 1000,
    },
  });

  return response;
}
