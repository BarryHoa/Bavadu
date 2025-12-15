import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";
import RoleModel from "../../../models/Role/RoleModel";

export async function GET(request: NextRequest) {
  try {
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

