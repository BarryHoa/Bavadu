import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

import { NextRequest } from "next/server";

import { createJob, setProgress } from "@base/server/import/importProgressStore";
import { processImport, validateImportFile } from "@base/server/import/processImport";
import { getTemplateConfig } from "@base/server/import/templateRegistry";
import UserPermissionModel from "@base/server/models/UserPermission/UserPermissionModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");

  if (!userId) {
    return JSONResponse({
      error: "Unauthorized",
      message: "Authentication required",
      status: 401,
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const key = (formData.get("key") as string | null) ?? "";

    if (!file || typeof file === "string") {
      return JSONResponse({ error: "No file provided", status: 400 });
    }

    const keyTrimmed = String(key).trim();

    if (!keyTrimmed) {
      return JSONResponse({
        error: "Template key is required",
        status: 400,
      });
    }

    const config = getTemplateConfig(keyTrimmed);

    if (!config) {
      return JSONResponse({
        error: `Template not found: ${keyTrimmed}`,
        status: 400,
      });
    }

    const requiredPermission = config.requiredPermission;

    if (!requiredPermission) {
      return JSONResponse({
        error: "Template has no required permission configured",
        status: 400,
      });
    }

    const permissionModel = new UserPermissionModel();
    const hasPermission = await permissionModel.hasAllPermissions(userId, [
      requiredPermission,
    ]);

    if (!hasPermission) {
      return JSONResponse({
        error: "Forbidden",
        message: "You do not have permission to import this template",
        status: 403,
      });
    }

    const validation = validateImportFile(file);

    if (!validation.valid) {
      return JSONResponse({
        error: validation.error,
        status: 400,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = tmpdir();
    const tempFileName = `import-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.xlsx`;
    const tempFilePath = join(tempDir, tempFileName);

    await writeFile(tempFilePath, buffer);

    const jobId = createJob({ requiredPermission });

    setProgress(jobId, { status: "processing" });

    void processImport({
      tempFilePath,
      key: keyTrimmed,
      jobId,
    });

    return JSONResponse({ jobId, status: 200 });
  } catch (error) {
    console.error("Import upload error:", error);

    return JSONResponse({
      error: "Upload failed",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
