import { getEnv } from "@/module-base/server";
import { NextRequest, NextResponse } from "next/server";
import ProductCategoryModel from "../../models/ProductCategory/ProductCategoryModel";

export async function GET(request: NextRequest) {
  const env = getEnv();
  const categoryModel = env.getModel("product.category") as
    | ProductCategoryModel
    | undefined;
  if (!categoryModel || typeof categoryModel.getViewDataList !== "function") {
    return NextResponse.json(
      {
        success: false,
        error: "Category model not available",
      },
      { status: 500 }
    );
  }
  const categories = await categoryModel.getViewDataList({
    offset: 0,
    limit: 1000,
  });
  return NextResponse.json(
    {
      success: true,
      data: categories,
    },
    { status: 200 }
  );
}
