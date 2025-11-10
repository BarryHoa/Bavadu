import { getEnv } from "@base/server";
import { NextRequest, NextResponse } from "next/server";

import type ProductModel from "../../models/Product/ProductModel";
import type { ProductCreateInput } from "../../models/Product/ProductModelInterface";

export const normalizeLocaleInput = (value: unknown) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    return { en: trimmed };
  }

  return value;
};

export const normalizeFeaturePayload = (features: unknown) => {
  if (!features || typeof features !== "object") {
    return {};
  }

  return Object.entries(features as Record<string, unknown>).reduce(
    (acc, [key, value]) => {
      if (typeof value === "boolean") {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, boolean>
  );
};

export const normalizePackings = (raw: unknown) => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item) => ({
    name: normalizeLocaleInput((item as any)?.name) ?? null,
    description: normalizeLocaleInput((item as any)?.description) ?? null,
    isActive:
      typeof (item as any)?.isActive === "boolean"
        ? (item as any)?.isActive
        : true,
  }));
};

export const normalizeAttributes = (raw: unknown) => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => ({
      code: typeof (item as any)?.code === "string" ? (item as any).code : "",
      name: normalizeLocaleInput((item as any)?.name) ?? null,
      value: typeof (item as any)?.value === "string" ? (item as any).value : "",
    }))
    .filter((attr) => attr.code && attr.name);
};

export const buildPayload = (body: any): ProductCreateInput => {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid payload");
  }

  const master = body.master ?? {};
  const variant = body.variant ?? {};

  const code = typeof master.code === "string" ? master.code.trim() : "";
  const type = typeof master.type === "string" ? master.type : "goods";

  if (!code) {
    throw new Error("Product code is required");
  }

  const masterPayload = {
    code,
    name: normalizeLocaleInput(master.name) ?? { en: code },
    description: normalizeLocaleInput(master.description) ?? null,
    type,
    features: normalizeFeaturePayload(master.features ?? {}),
    isActive:
      typeof master.isActive === "boolean" ? master.isActive : true,
    brand: normalizeLocaleInput(master.brand) ?? null,
    categoryId:
      typeof master.categoryId === "string" && master.categoryId
        ? master.categoryId
        : null,
  };

  const variantNameSource = normalizeLocaleInput(variant.name);

  const variantPayload = {
    name: variantNameSource ?? { en: code },
    description: normalizeLocaleInput(variant.description) ?? null,
    sku: typeof variant.sku === "string" ? variant.sku : null,
    barcode: typeof variant.barcode === "string" ? variant.barcode : null,
    manufacturer:
      variant.manufacturer && typeof variant.manufacturer === "object"
        ? {
            name: normalizeLocaleInput(variant.manufacturer.name) ?? null,
            code:
              typeof variant.manufacturer.code === "string"
                ? variant.manufacturer.code
                : null,
          }
        : null,
    baseUomId:
      typeof variant.baseUomId === "string" && variant.baseUomId
        ? variant.baseUomId
        : null,
    isActive:
      typeof variant.isActive === "boolean" ? variant.isActive : true,
    images: Array.isArray(variant.images) ? variant.images : undefined,
  };

  return {
    master: masterPayload,
    variant: variantPayload,
    packings: normalizePackings(body.packings),
    attributes: normalizeAttributes(body.attributes),
  };
};

export async function POST(request: NextRequest) {
  try {
    const env = getEnv();
    const productModel = env.getModel("product") as ProductModel | undefined;

    if (!productModel || typeof productModel.createProduct !== "function") {
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
    const payload = buildPayload(body);

    const product = await productModel.createProduct(payload);

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create product";

    const statusCode = /invalid|required/i.test(message) ? 400 : 500;

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
        message,
      },
      { status: statusCode }
    );
  }
}
