import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  return getModuleQueryByModel({
    model: "purchase.order",
    modelMethod: "list",
    params: {},
  });
}
