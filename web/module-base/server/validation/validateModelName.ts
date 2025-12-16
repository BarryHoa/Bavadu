import { JSONResponse } from "../utils/JSONResponse";

/**
 * Check if a model name ends with the specified type
 * @param model - Model name (e.g., "b2c-sales.price-list.view-list")
 * @param type - Type to check (e.g., "view-list", "dropdown-list")
 * @returns true if the model name ends with the type, false otherwise
 */
export async function validateModelName(
  model: string,
  type: string,
): Promise<void | Response> {
  if (!model || !type) {
    return JSONResponse({
      status: 400,
      message: "MODEL AND TYPE ARE REQUIRED",
    });
  }

  // Get the last segment after the last dot
  const lastSegment = model.split(".").pop();

  if (!lastSegment || lastSegment !== type) {
    return JSONResponse({
      status: 400,
      message: "MODEL NAME IS NOT ACCEPT",
    });
  }
}
