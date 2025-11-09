import { getEnv } from "@base/server";
import { NextRequest, NextResponse } from "next/server";
import type ProductCategoryModel from "../../models/ProductCategory/ProductCategoryModel";

const normalizeLocaleInput = (value: unknown) => {
  if (!value) return null;
  if (typeof value === "string") return { en: value };
  if (typeof value === "object") return value;
  return null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category ID",
          message: "Category ID is required",
        },
        { status: 400 }
      );
    }

    const env = getEnv();
    const categoryModel = env.getModel("product.category") as
      | ProductCategoryModel
      | undefined;

    if (!categoryModel || typeof categoryModel.getCategoryById !== "function") {
      return NextResponse.json(
        {
          success: false,
          error: "Category model not available",
          message: "The product category model is not registered or invalid.",
        },
        { status: 500 }
      );
    }

    const category = await categoryModel.getCategoryById(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
          message: `Category with id ${id} was not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch category",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category ID",
          message: "Category ID is required",
        },
        { status: 400 }
      );
    }

    const payload = await request.json();
    const env = getEnv();
    const categoryModel = env.getModel("product.category") as
      | ProductCategoryModel
      | undefined;

    if (!categoryModel || typeof categoryModel.updateCategory !== "function") {
      return NextResponse.json(
        {
          success: false,
          error: "Category model not available",
          message: "The product category model is not registered or invalid.",
        },
        { status: 500 }
      );
    }

    const updatePayload: any = {};

    if (payload.code !== undefined) updatePayload.code = String(payload.code);
    if (payload.name !== undefined)
      updatePayload.name = normalizeLocaleInput(payload.name);
    if (payload.description !== undefined)
      updatePayload.description = normalizeLocaleInput(payload.description);
    if (payload.parentId !== undefined)
      updatePayload.parentId =
        payload.parentId === null || payload.parentId === ""
          ? null
          : String(payload.parentId);
    if (payload.level !== undefined) {
      updatePayload.level =
        payload.level === null || payload.level === ""
          ? null
          : Number(payload.level);
    }
    if (payload.isActive !== undefined) {
      updatePayload.isActive = Boolean(payload.isActive);
    }

    const updatedCategory = await categoryModel.updateCategory(
      id,
      updatePayload
    );

    if (!updatedCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "Category not found",
          message: `Category with id ${id} was not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update category",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
