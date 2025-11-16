import getModuleQueryByModel from "@/module-base/server/utils/getModuleQueryByModel";
import { NextRequest, NextResponse } from "next/server";

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

    const response = await getModuleQueryByModel({
      model: "product.category",
      modelMethod: "getDataById",
      params: { id },
    });

    return response;
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

    const response = await getModuleQueryByModel({
      model: "product.category",
      modelMethod: "updateData",
      params: {
        id,
        payload,
      },
    });

    return response;
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
