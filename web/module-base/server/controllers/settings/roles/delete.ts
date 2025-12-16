import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

import RoleModel from "../../../models/Role/RoleModel";

export async function DELETE(request: NextRequest) {
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
    const result = await roleModel.deleteRole(id);

    if (!result.success) {
      return JSONResponse({
        error: result.message,
        status: result.message === "Role not found" ? 404 : 400,
      });
    }

    return JSONResponse({
      message: result.message,
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting role:", error);

    return JSONResponse({
      error: "Failed to delete role",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
