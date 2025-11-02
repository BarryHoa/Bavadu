import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/module-base/server/env";

// Handles POST requests to fetch a list of products
export async function POST(request: NextRequest) {
  try {
    // ✅ Use env pattern (like Odoo env['product.product'])
    const env = getEnv();
    const productModel = env.get("product.variant"); // Model ID từ ProductModel constructor
    
    // Parse request body for parameters
    const params = await request.json();
    const data = await productModel.getProducts(params);

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
