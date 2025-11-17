import getModuleQueryByModel from "@/module-base/server/utils/getModuleQueryByModel";
import { NextRequest, NextResponse } from "next/server";
import type { ProductCreateInput } from "../../models/Product/ProductModelInterface";
import type { ProductMasterFeatures } from "../../models/interfaces/ProductMaster";

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

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const result: Record<string, string> = {};

    if (typeof record.en === "string" && record.en.trim()) {
      result.en = record.en.trim();
    }

    if (typeof record.vi === "string" && record.vi.trim()) {
      result.vi = record.vi.trim();
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  return null;
};

export const normalizeFeaturePayload = (features: unknown) => {
  if (!features || typeof features !== "object") {
    return null;
  }

  const allowedKeys: Array<keyof ProductMasterFeatures> = [
    "sale",
    "purchase",
    "manufacture",
    "subcontract",
    "stockable",
    "maintenance",
    "asset",
    "accounting",
  ];

  const acc: Partial<ProductMasterFeatures> = {};

  for (const [key, value] of Object.entries(
    features as Record<string, unknown>
  )) {
    if (
      allowedKeys.includes(key as keyof ProductMasterFeatures) &&
      typeof value === "boolean"
    ) {
      acc[key as keyof ProductMasterFeatures] = value;
    }
  }

  return Object.keys(acc).length > 0 ? acc : null;
};

export const normalizePackings = (raw: unknown) => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item) => ({
    name: normalizeLocaleInput((item as any)?.name),
    description: normalizeLocaleInput((item as any)?.description),
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
      name: normalizeLocaleInput((item as any)?.name),
      value:
        typeof (item as any)?.value === "string" ? (item as any).value : "",
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
    description:
      typeof master.description === "string" && master.description.trim()
        ? master.description.trim()
        : null,
    type,
    features: normalizeFeaturePayload(master.features ?? {}),
    isActive: typeof master.isActive === "boolean" ? master.isActive : true,
    brand:
      typeof master.brand === "string" && master.brand.trim()
        ? master.brand.trim()
        : null,
    categoryId:
      typeof master.categoryId === "string" && master.categoryId
        ? master.categoryId
        : null,
  };

  const variantNameSource = normalizeLocaleInput(variant.name);

  const variantPayload = {
    name: variantNameSource ?? { en: code },
    description:
      typeof variant.description === "string" && variant.description.trim()
        ? variant.description.trim()
        : null,
    sku: typeof variant.sku === "string" ? variant.sku : null,
    barcode: typeof variant.barcode === "string" ? variant.barcode : null,
    manufacturer:
      variant.manufacturer && typeof variant.manufacturer === "object"
        ? {
            name:
              typeof variant.manufacturer.name === "string" &&
              variant.manufacturer.name.trim()
                ? variant.manufacturer.name.trim()
                : null,
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
    isActive: typeof variant.isActive === "boolean" ? variant.isActive : true,
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
    const body = await request.json();
    const payload = buildPayload(body);

    const response = await getModuleQueryByModel({
      model: "product",
      modelMethod: "createProduct",
      params: payload,
    });

    return response;
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
