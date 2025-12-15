import { JSONResponse } from "@base/server/utils/JSONResponse";
import { escapeHtml } from "@base/server/utils/xss-protection";
import { RuntimeContext } from "../../../runtime/RuntimeContext";

type ReloadModelRequest = {
  key?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as ReloadModelRequest;
    const modelKey = typeof body.key === "string" ? body.key.trim() : "";

    if (!modelKey) {
      return JSONResponse({
        message: "Model key is required.",
        status: 400,
      });
    }

    const modelInstance = await RuntimeContext.getModelInstance();
    if (!modelInstance) {
      return JSONResponse({
        message: "Model instance is not available.",
        status: 500,
      });
    }

    const reloaded = await modelInstance.reloadModel(modelKey);
    if (!reloaded) {
      // Sanitize modelKey to prevent XSS in error message
      const safeModelKey = escapeHtml(modelKey);
      return JSONResponse({
        message: `Failed to reload model "${safeModelKey}".`,
        status: 404,
      });
    }

    // Sanitize modelKey to prevent XSS in success message
    const safeModelKey = escapeHtml(modelKey);
    return JSONResponse({
      message: `Model "${safeModelKey}" reloaded successfully.`,
      status: 200,
    });
  } catch (error) {
    console.error("Failed to reload model:", error);
    return JSONResponse({
      message: "Unexpected error while reloading model.",
      status: 500,
    });
  }
}
