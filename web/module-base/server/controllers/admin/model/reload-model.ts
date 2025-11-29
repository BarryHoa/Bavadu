import { JSONResponse } from "@base/server/utils/JSONResponse";
import getEnv from "../../../utils/getEnv";

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

    const env = getEnv();
    if (!env) {
      return JSONResponse({
        message: "Environment is not available.",
        status: 500,
      });
    }

    const reloaded = await env.reloadModel(modelKey);
    if (!reloaded) {
      return JSONResponse({
        message: `Failed to reload model "${modelKey}".`,
        status: 404,
      });
    }

    return JSONResponse({
      message: `Model "${modelKey}" reloaded successfully.`,
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

