import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "../../middleware/auth";
import PriceListB2CModel from "../../models/PriceListB2C/PriceListB2CModel";
import { JSONResponse } from "../../utils/JSONResponse";

export async function POST(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const payload = await request.json();

    const {
      code,
      name,
      description,
      type,
      status,
      priority,
      currencyId,
      validFrom,
      validTo,
      isDefault,
      applicableTo,
    } = payload;

    // Validate required fields
    if (!code || !name || !type || !status || !validFrom || !applicableTo) {
      return JSONResponse({
        message:
          "code, name, type, status, validFrom, and applicableTo are required",
        status: 400,
      });
    }

    const model = new PriceListB2CModel();
    const priceList = await model.create({
      code,
      name,
      description,
      type,
      status,
      priority,
      currencyId,
      validFrom: new Date(validFrom),
      validTo: validTo ? new Date(validTo) : null,
      isDefault,
      applicableTo,
      createdBy: user?.id,
    });

    return JSONResponse({
      data: priceList,
      message: "Price list created successfully",
      status: 201,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create price list";
    return JSONResponse({ message, status: 400 });
  }
}
