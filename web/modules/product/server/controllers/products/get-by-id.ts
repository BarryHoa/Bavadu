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
    const productModel = env.getModel("product") as
      | ProductModel
      | undefined; // Model ID từ ProductModel constructor

    if (!productModel || typeof (productModel as ProductModel).getProductDetail !== "function") {
      return NextResponse.json(
        {
          success: false,
          error: "Product model not available",
          message: "The product model is not registered or invalid.",
        },
        { status: 500 }
      );
    }

    const product = await (productModel as ProductModel).getProductDetail(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
          message: `Product with id ${id} was not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
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
