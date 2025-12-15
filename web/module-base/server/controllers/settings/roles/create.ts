import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";
import RoleModel, { type RoleInput } from "../../../models/Role/RoleModel";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, description, permissionIds } = body;

    if (!code || !name) {
      return JSONResponse({
        error: "Code and name are required",
        status: 400,
      });
    }

    const roleModel = new RoleModel();

    // Check if role with same code already exists
    const existingRole = await roleModel.getRoleByCode(code);

    if (existingRole) {
      return JSONResponse({
        error: "Role with this code already exists",
        status: 400,
      });
    }

    const permissions = Array.isArray(permissionIds) ? permissionIds : [];

    const roleInput: RoleInput = {
      code,
      name,
      description: description || null,
      permissions,
      isSystem: false,
      isActive: true,
    };

    const newRole = await roleModel.createRole(roleInput);

    return JSONResponse({
      data: newRole,
      message: "Role created successfully",
      status: 201,
    });
  } catch (error) {
    console.error("Error creating role:", error);
    return JSONResponse({
      error: "Failed to create role",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
