import { requirePermissions } from "@base/server/middleware";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

import RoleModel from "../../../models/Role/RoleModel";

const REQUIRED_PERMISSIONS = ["settings.roles.read"];

export async function GET(request: NextRequest) {
  try {
    const authzResponse = await requirePermissions(
      request,
      REQUIRED_PERMISSIONS,
    );

    if (authzResponse) {
      return authzResponse;
    }

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
