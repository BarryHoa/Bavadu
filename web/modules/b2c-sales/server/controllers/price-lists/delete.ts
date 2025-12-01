import { NextRequest } from "next/server";
import PriceListB2CModel from "../../models/PriceList/PriceListB2CModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";

export async function DELETE(request: NextRequest) {
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
    const deleted = await model.delete(id);

    if (!deleted) {
      return JSONResponse({
        message: `Price list with id "${id}" not found`,
        status: 404,
      });
    }

    return JSONResponse({
      message: "Price list deleted successfully",
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete price list";
    return JSONResponse({ message, status: 400 });
  }
}

