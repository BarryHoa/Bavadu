import { JSONResponse } from "@base/server/utils/JSONResponse";

import PermissionModel from "../../../models/Permission/PermissionModel";

export async function GET() {
  try {
    const permissionModel = new PermissionModel();
    const permissions = await permissionModel.getPermissions();

    return JSONResponse({
      data: permissions,
      total: permissions.length,
      message: `Loaded ${permissions.length} permission(s)`,
      status: 200,
    });
  } catch (error) {
    console.error("Error loading permissions:", error);

    return JSONResponse({
      data: [],
      error: "Failed to load permissions",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
