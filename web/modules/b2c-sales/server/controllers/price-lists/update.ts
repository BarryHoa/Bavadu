import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@base/server/middleware/auth";
import PriceListB2CViewListModel from "../../models/PriceList/PriceListB2CViewListModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";

export async function PUT(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const payload = await request.json();

    const { id, ...updateData } = payload;

    if (!id) {
      return JSONResponse({
        message: "id is required",
        status: 400,
      });
    }

    const model = new PriceListB2CViewListModel();

    // Convert date strings to Date objects if present
    const processedData: any = { ...updateData };
    if (processedData.validFrom) {
      processedData.validFrom = new Date(processedData.validFrom);
    }
    if (processedData.validTo !== undefined) {
      processedData.validTo = processedData.validTo
        ? new Date(processedData.validTo)
        : null;
    }
    processedData.updatedBy = user?.id;

    const priceList = await model.update(id, processedData);

    return JSONResponse({
      data: priceList,
      message: "Price list updated successfully",
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update price list";
    return JSONResponse({ message, status: 400 });
  }
}

