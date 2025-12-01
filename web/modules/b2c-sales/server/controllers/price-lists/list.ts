import { NextRequest } from "next/server";
import PriceListB2CModel from "../../models/PriceList/PriceListB2CModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";

export async function GET(request: NextRequest) {
  try {
    const model = new PriceListB2CModel();
    // Simple list
    const priceLists = await model.getList();
    return JSONResponse({
      data: priceLists,
      total: priceLists.length,
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list price lists";
    return JSONResponse({ message, status: 400 });
  }
}

// POST for view list data table
export async function POST(request: NextRequest) {
  try {
    const model = new PriceListB2CModel();
    const body = await request.json().catch(() => ({}));
    const params = body.params || {};

    const response = await model.getData(params);
    return JSONResponse({
      data: response.data,
      total: response.total,
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list price lists";
    return JSONResponse({ message, status: 400 });
  }
}

