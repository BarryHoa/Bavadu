import type { LocaleDataType } from "@base/server/interfaces/Locale";
import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

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
      return JSONResponse({
        error: "Invalid payload",
        message: "Both code and name are required",
        status: 400,
      });
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

    const response = await getModuleQueryByModel({
      model: "product.category",
      modelMethod: "createCategory",
      params: payload,
    });

    return response;
  } catch (error) {
    return JSONResponse({
      error: "Failed to create category",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
