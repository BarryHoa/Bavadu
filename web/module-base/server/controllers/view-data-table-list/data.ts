import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "../../env";
import modelSystemStore from "../../models/ModelSystemStore";

/**
 * Load model instance from modelId string
 * Format: "module.ModelName" -> loads from "@mdl/module/server/models/ModelName/ModelName"
 *
 * ⚠️ NOTE: Dynamic import với template string KHÔNG work trên Edge Runtime
 * Chỉ chạy được trên Node.js runtime. Đảm bảo route có: export const runtime = "nodejs"
 *
 * This is a fallback if model is not in registry yet (on-demand loading)
 */
async function loadModel(modelId: string): Promise<any> {
  // Check runtime - dynamic imports only work on Node.js
  if (typeof process === "undefined" || process.env.NEXT_RUNTIME === "edge") {
    throw new Error(
      `Cannot load model ${modelId} on Edge Runtime. Dynamic imports are not supported. ` +
        `Ensure models are pre-loaded at server startup and route has: export const runtime = "nodejs"`
    );
  }

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

    // ⚠️ Dynamic import with template string - ONLY works on Node.js runtime
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
    console.log("body", body, modelId, params);
    if (!modelId || typeof modelId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid modelId" },
        { status: 400 }
      );
    }

    // ✅ Use env pattern (like Odoo env['model.name'])
    const env = getEnv();

    // Try to get model from registry first
    let modelInstance;
    try {
      if (env.has(modelId)) {
        modelInstance = env.get(modelId);
      } else {
        // Fallback: try on-demand loading if not in registry
        // Note: This should rarely happen if models are loaded at server startup
        console.warn(
          `⚠️  Model ${modelId} not found in registry, attempting on-demand load...`
        );
        modelInstance = await loadModel(modelId);
      }
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
