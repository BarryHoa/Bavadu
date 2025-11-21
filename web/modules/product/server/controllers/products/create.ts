import { getAuthenticatedUser } from "@base/server/utils/auth-helpers";
import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { validateRequest } from "@base/server/validation/middleware";
import { productCreateInputSchema } from "@base/server/validation/schemas/product";
import { NextRequest, NextResponse } from "next/server";
import type { ProductCreateInput } from "../../models/Product/ProductModelInterface";
import {
  ProductMasterFeaturesEnum,
  type ProductMasterFeatures,
} from "../../models/interfaces/ProductMaster";
import {
  normalizeProductFeatures,
  validateProductFeatures,
} from "../../utils/product-features-validator";

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
    ProductMasterFeaturesEnum.SALE,
    ProductMasterFeaturesEnum.PURCHASE,
    ProductMasterFeaturesEnum.MANUFACTURE,
    ProductMasterFeaturesEnum.SUBCONTRACT,
    ProductMasterFeaturesEnum.STOCKABLE,
    ProductMasterFeaturesEnum.MAINTENANCE,
    ProductMasterFeaturesEnum.ASSET,
    ProductMasterFeaturesEnum.ACCOUNTING,
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
    description: (item as any)?.description?.trim() || null,
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

  // Normalize and validate features based on product type
  const rawFeatures = normalizeFeaturePayload(master.features ?? {});
  const normalizedFeatures = normalizeProductFeatures(
    type as any,
    rawFeatures ?? {}
  );

  // Validate features
  const validationErrors = validateProductFeatures(
    type as any,
    normalizedFeatures
  );
  if (validationErrors.length > 0) {
    throw new Error(
      `Invalid features for product type "${type}": ${validationErrors.join(", ")}`
    );
  }

  const masterPayload = {
    code,
    name: normalizeLocaleInput(master.name) ?? { en: code },
    description: master.description?.trim() || null,
    type,
    features: normalizedFeatures,
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
    description: variant.description?.trim() || null,
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

async function handlePOST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequest(request, productCreateInputSchema);
    if (!validation.valid) {
      return validation.response;
    }

    // Build payload from validated data
    const payload = buildPayload(validation.data);

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

export async function POST(request: NextRequest) {
  // Authentication is handled by proxy.ts
  // User info is available in headers if authenticated
  const user = getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentication required",
        message: "You must be authenticated to perform this action",
      },
      { status: 401 }
    );
  }

  // Call handler
  return handlePOST(request);
}
