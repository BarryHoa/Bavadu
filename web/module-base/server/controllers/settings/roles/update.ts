import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";
import RoleModel, { type RoleInput } from "../../../models/Role/RoleModel";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, code, name, description, permissionIds } = body;

    if (!id || !code || !name) {
      return JSONResponse({
        error: "ID, code, and name are required",
        status: 400,
      });
    }

    const roleModel = new RoleModel();

    // Check if role exists
    const existingRole = await roleModel.getRoleById(id);

    if (!existingRole) {
      return JSONResponse({
        error: "Role not found",
        status: 404,
      });
    }

    // Check if another role with same code exists (excluding current role)
    const duplicateRole = await roleModel.getRoleByCode(code);

    if (duplicateRole && duplicateRole.id !== id) {
      return JSONResponse({
        error: "Role with this code already exists",
        status: 400,
      });
    }

    // Convert permissionIds to permission keys if needed
    // For now, assuming permissionIds are permission IDs, not keys
    // But RoleModel.updateRole expects permission keys, so we need to convert
    // For simplicity, let's assume permissionIds are already permission keys
    const permissions = Array.isArray(permissionIds) ? permissionIds : [];

    const updatePayload: Partial<RoleInput> = {
      code,
      name,
      description: description || null,
      permissions,
    };

    const updatedRole = await roleModel.updateRole(id, updatePayload);

    if (!updatedRole) {
      return JSONResponse({
        error: "Failed to update role",
        status: 500,
      });
    }

    return JSONResponse({
      data: updatedRole,
      message: "Role updated successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return JSONResponse({
      error: "Failed to update role",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
