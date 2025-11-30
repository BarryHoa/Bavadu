import { NextRequest, NextResponse } from "next/server";
import { PricingService } from "@base/server/services/PricingService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productVariantId,
      productMasterId,
      quantity,
      priceListId,
      customerGroupId,
      channel,
      region,
    } = body;

    // Validation
    if (!productVariantId || !productMasterId || !quantity) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["productVariantId", "productMasterId", "quantity"],
          optional: ["priceListId"], // priceListId là optional, sẽ tự động tìm default
        },
        { status: 400 }
      );
    }

    const quantityNum = Number(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive number" },
        { status: 400 }
      );
    }

    const pricingService = new PricingService();
    const result = await pricingService.calculatePrice({
      productVariantId,
      productMasterId,
      quantity: quantityNum,
      priceListId,
      customerGroupId,
      channel,
      region,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error calculating price:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

