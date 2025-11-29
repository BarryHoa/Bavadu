import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";
import type { ProductUpdateInput } from "../../models/Product/ProductModelInterface";

import { buildPayload as buildCreatePayload } from "./create";

const buildUpdatePayload = (body: any, id: string): ProductUpdateInput => {
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
      return JSONResponse({
        error: "Invalid product ID",
        message: "Product ID is required",
        status: 400,
      });
    }

    const body = await request.json();
    const payload = buildUpdatePayload(body, id);

    const response = await getModuleQueryByModel({
      model: "product",
      modelMethod: "updateProduct",
      params: payload,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update product";

    const statusCode = message.includes("not found")
      ? 404
      : /invalid|required/i.test(message)
        ? 400
        : 500;

    return JSONResponse({
      error: "Failed to update product",
      message,
      status: statusCode,
    });
  }
}
