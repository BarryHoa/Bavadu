import { NextRequest, NextResponse } from "next/server";

import productsModel from "@/modules/product/server/models/ProductModel/ProductModel";

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

    const product = await productsModel.getProductById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
          message: `Product with ID ${id} does not exist`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
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
