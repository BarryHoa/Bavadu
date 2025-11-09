import { getEnv } from "@base/server";
import { NextRequest, NextResponse } from "next/server";
import type ProductModel from "../../models/Product/ProductModel";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid product ID",
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    // ✅ Use env pattern (like Odoo env['product.product'])
    const env = getEnv();
    const productModel = env.getModel("product.variant") as
      | ProductModel
      | undefined; // Model ID từ ProductModel constructor

    if (!productModel || typeof productModel.getProductById !== "function") {
      return NextResponse.json(
        {
          success: false,
          error: "Product model not available",
          message: "The product model is not registered or invalid.",
        },
        { status: 500 }
      );
    }

    const product = await productModel.getProductById(id);

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
