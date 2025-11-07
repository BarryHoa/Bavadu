import { NextResponse } from "next/server";

import getEnv from "../../../utils/getEnv";

type ReloadModelRequest = {
  key?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as ReloadModelRequest;
    const modelKey = typeof body.key === "string" ? body.key.trim() : "";

    if (!modelKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Model key is required.",
        },
        { status: 400 }
      );
    }

    const env = getEnv();
    if (!env) {
      return NextResponse.json(
        {
          success: false,
          message: "Environment is not available.",
        },
        { status: 500 }
      );
    }

    const reloaded = await env.reloadModel(modelKey);
    if (!reloaded) {
      return NextResponse.json(
        {
          success: false,
          message: `Failed to reload model "${modelKey}".`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Model "${modelKey}" reloaded successfully.`,
    });
  } catch (error) {
    console.error("Failed to reload model:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error while reloading model.",
      },
      { status: 500 }
    );
  }
}

