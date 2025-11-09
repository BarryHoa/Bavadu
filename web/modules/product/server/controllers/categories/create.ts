import { getEnv } from "@base/server";
import type { LocaleDataType } from "@base/server/interfaces/Locale";
import { NextRequest, NextResponse } from "next/server";
import type ProductCategoryModel from "../../models/ProductCategory/ProductCategoryModel";

const normalizeLocaleInput = (
  value: unknown
): LocaleDataType<string> | null => {
  if (!value) return null;
  if (typeof value === "string") {
    return { en: value };
  }
  if (typeof value === "object") {
    return value as LocaleDataType<string>;
  }
  return null;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, description, parentId, level, isActive } = body ?? {};

    if (!code || !name) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payload",
          message: "Both code and name are required",
        },
        { status: 400 }
      );
    }

    const env = getEnv();
    const categoryModel = env.getModel("product.category") as
      | ProductCategoryModel
      | undefined;

    if (!categoryModel || typeof categoryModel.createCategory !== "function") {
      return NextResponse.json(
        {
          success: false,
          error: "Category model not available",
          message: "The product category model is not registered or invalid.",
        },
        { status: 500 }
      );
    }

    const payload = {
      code: String(code).trim(),
      name: normalizeLocaleInput(name) ?? { en: String(name) },
      description: normalizeLocaleInput(description),
      parentId: parentId ? String(parentId) : null,
      level:
        typeof level === "number"
          ? level
          : level !== undefined && level !== null && level !== ""
            ? Number(level)
            : null,
      isActive:
        typeof isActive === "boolean"
          ? isActive
          : isActive === undefined
            ? true
            : Boolean(isActive),
    };

    const category = await categoryModel.createCategory(payload);

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
