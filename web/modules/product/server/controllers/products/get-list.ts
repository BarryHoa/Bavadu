import ProductModel from "../../models/ProductModel/ProductModel";

import { NextRequest, NextResponse } from "next/server";

// Handles POST requests to fetch a list of products
export async function POST(request: NextRequest) {
  try {
    // Parse request body for parameters
    const params = await request.json();
    const data = await ProductModel.getProducts(params);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product list",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
