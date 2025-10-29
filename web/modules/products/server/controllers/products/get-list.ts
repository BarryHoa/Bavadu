import { NextRequest, NextResponse } from "next/server";

import productsModel from "../../models/ProductsModel";
import { GetProductListReq } from "../../../shared/types/ProductTypes";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const params: GetProductListReq = {
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : 0,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 10,
      search: searchParams.get("search") || undefined,
    };

    // Parse filters
    const filters: Record<string, any> = {};

    searchParams.forEach((value, key) => {
      if (key.startsWith("filter_")) {
        const filterKey = key.replace("filter_", "");

        // Convert string values to appropriate types
        if (value === "true" || value === "false") {
          filters[filterKey] = value === "true";
        } else if (!isNaN(Number(value))) {
          filters[filterKey] = Number(value);
        } else {
          filters[filterKey] = value;
        }
      }
    });
    params.filters = Object.keys(filters).length > 0 ? filters : undefined;

    // Parse sorts
    const sortParam = searchParams.get("sort");

    if (sortParam) {
      try {
        params.sorts = JSON.parse(sortParam);
      } catch {
        // Invalid sort format, ignore
      }
    }

    const result = await productsModel.getProducts(params);

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
