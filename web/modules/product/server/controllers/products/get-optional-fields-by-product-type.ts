import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";
import { ProductMasterEnum } from "../../models/interfaces/ProductMaster";
import { getOptionalFieldsByProductType } from "../../utils/optional-fields";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as ProductMasterEnum | null;

    if (!type) {
      return JSONResponse({
        error: "Missing product type",
        message: "Product type parameter is required",
        status: 400,
      });
    }

    // Validate product type
    if (!Object.values(ProductMasterEnum).includes(type)) {
      return JSONResponse({
        error: "Invalid product type",
        message: `Product type must be one of: ${Object.values(ProductMasterEnum).join(", ")}`,
        status: 400,
      });
    }

    const optionalFields = getOptionalFieldsByProductType(type);

    return JSONResponse({
      data: optionalFields,
      status: 200,
    });
  } catch (error) {
    return JSONResponse({
      error: "Failed to fetch optional fields",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
