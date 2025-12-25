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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return JSONResponse({
        error: "Role ID is required",
        status: 400,
      });
    }

    const roleModel = new RoleModel();
    const result = await roleModel.getRoleWithPermissions(id);

    if (!result) {
      return JSONResponse({
        error: "Role not found",
        status: 404,
      });
    }

    return JSONResponse({
      data: {
        ...result.role,
        permissions: result.permissions,
      },
      message: "Role loaded successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error loading role:", error);

    return JSONResponse({
      error: "Failed to load role",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
