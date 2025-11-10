import { getEnv } from "@base/server";
import { NextRequest, NextResponse } from "next/server";

import type ProductModel from "../../models/Product/ProductModel";
import type { ProductUpdateInput } from "../../models/Product/ProductModelInterface";

import { buildPayload as buildCreatePayload } from "./create";

const buildUpdatePayload = (
  body: any,
  id: string
): ProductUpdateInput => {
  const createPayload = buildCreatePayload(body);
  return {
    id,
    master: createPayload.master,
    variant: createPayload.variant,
    packings: createPayload.packings,
    attributes: createPayload.attributes,
  };
};

export async function PATCH(
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

    const env = getEnv();
    const productModel = env.getModel("product") as ProductModel | undefined;

    if (!productModel || typeof productModel.updateProduct !== "function") {
      return NextResponse.json(
        {
          success: false,
          error: "Product model not available",
          message: "The product model is not registered or invalid.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const payload = buildUpdatePayload(body, id);

    const product = await productModel.updateProduct(payload);

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update product";

    const statusCode = message.includes("not found")
      ? 404
      : /invalid|required/i.test(message)
        ? 400
        : 500;

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
        message,
      },
      { status: statusCode }
    );
  }
}
