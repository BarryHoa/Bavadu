import { NextRequest } from "next/server";
import getModuleQueryByModel from "@/module-base/server/utils/getModuleQueryByModel";

export async function GET(_request: NextRequest) {
  return getModuleQueryByModel({
    model: "sale.order",
    modelMethod: "list",
    params: {},
  });
}

