import getModuleQueryByModel from "@/module-base/server/utils/getModuleQueryByModel";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  return getModuleQueryByModel({
    model: "stock.warehouse",
    modelMethod: "listWarehouses",
    params: {},
  });
}
