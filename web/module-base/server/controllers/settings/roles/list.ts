import { JSONResponse } from "@base/server/utils/JSONResponse";

import RoleModel from "../../../models/Role/RoleModel";

export async function GET() {
  try {
    const roleModel = new RoleModel();
    const roles = await roleModel.getAllRoles();

    return JSONResponse({
      data: roles,
      total: roles.length,
      message: `Loaded ${roles.length} role(s)`,
      status: 200,
    });
  } catch (error) {
    console.error("Error loading roles:", error);

    return JSONResponse({
      data: [],
      error: "Failed to load roles",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
