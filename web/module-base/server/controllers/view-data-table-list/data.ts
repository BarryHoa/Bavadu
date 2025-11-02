import { NextRequest, NextResponse } from "next/server";
import modelSystemStore from "../../models/ModelSystemStore";

/**
 * Load model instance from modelId string
 * Format: "module.ModelName" -> loads from "@mdl/module/server/models/ModelName/ModelName"
 */
async function loadModel(modelId: string): Promise<any> {
  // Check if already in store
  if (modelSystemStore.has(modelId)) {
    return modelSystemStore.get(modelId);
  }

  try {
    const [module, modelName] = modelId.split(".");

    if (!module || !modelName) {
      throw new Error(
        `Invalid modelId format: ${modelId}. Expected "module.ModelName"`
      );
    }

    // Import model module - this will create the instance and register it via BaseModel constructor
    const modelPath = `@mdl/${module}/server/models/${modelName}/${modelName}`;
    const modelModule = await import(modelPath);
    const modelInstance = modelModule.default;

    if (!modelInstance) {
      throw new Error(`Model ${modelName} not found in module ${module}`);
    }

    // Model should now be in store (registered by BaseModel constructor)
    // But it might be registered with a different key (e.g., "product" instead of "product.ProductModel")
    // So we ensure it's also registered with the requested modelId
    if (!modelSystemStore.has(modelId)) {
      // Register it with the requested modelId
      modelSystemStore.set(modelId, modelInstance);
    }

    return modelInstance;
  } catch (error) {
    throw new Error(
      `Failed to load model ${modelId}: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Example edge handler for /view-list-data-table/data route (GET)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId, params } = body ?? {};

    if (!modelId || typeof modelId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid modelId" },
        { status: 400 }
      );
    }

    // Load model instance (from store or dynamically)
    let modelInstance = modelSystemStore.get(modelId);

    if (!modelInstance) {
      try {
        modelInstance = await loadModel(modelId);
      } catch (loadError) {
        console.error("Failed to load model:", loadError);
        return NextResponse.json(
          {
            error: "Model not found",
            message:
              loadError instanceof Error
                ? loadError.message
                : "Failed to load model",
          },
          { status: 404 }
        );
      }
    }

    if (
      !modelInstance ||
      typeof modelInstance.getDefaultParamsForList !== "function"
    ) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // Extract params from request body
    const { offset, limit, search, filters, sorts } = params || {};

    // Prepare params for list
    let parsedFilters = undefined;
    let parsedSorts = undefined;

    if (filters) {
      try {
        parsedFilters =
          typeof filters === "string" ? JSON.parse(filters) : filters;
      } catch {
        return NextResponse.json(
          { error: "Invalid 'filters' format" },
          { status: 400 }
        );
      }
    }

    if (sorts) {
      try {
        parsedSorts = typeof sorts === "string" ? JSON.parse(sorts) : sorts;
      } catch {
        return NextResponse.json(
          { error: "Invalid 'sorts' format" },
          { status: 400 }
        );
      }
    }

    const listParams = modelInstance.getDefaultParamsForList({
      offset: offset ? Number(offset) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search ? String(search) : undefined,
      filters: parsedFilters,
      sorts: parsedSorts,
    });

    if (typeof modelInstance.getList !== "function") {
      return NextResponse.json(
        { error: "Model does not implement getList" },
        { status: 500 }
      );
    }

    // Fetch data (might be async)
    const result = await modelInstance.getList(listParams);

    // Optionally wrap with pagination if desired
    let responseData = result;
    if (typeof modelInstance.getPagination === "function") {
      responseData = modelInstance.getPagination(result);
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
