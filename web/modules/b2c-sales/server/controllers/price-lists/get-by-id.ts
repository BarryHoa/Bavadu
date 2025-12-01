import { NextRequest } from "next/server";
import PriceListB2CModel from "../../models/PriceList/PriceListB2CModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return JSONResponse({
        message: "id parameter is required",
        status: 400,
      });
    }

    const model = new PriceListB2CModel();
    const priceList = await model.getById(id);

    if (!priceList) {
      return JSONResponse({
        message: `Price list with id "${id}" not found`,
        status: 404,
      });
    }

    return JSONResponse({
      data: priceList,
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get price list";
    return JSONResponse({ message, status: 400 });
  }
}

