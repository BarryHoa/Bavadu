import { JSONResponse } from "@base/server/utils/JSONResponse";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { base_tb_roles } from "../../../schemas/base.role";
import { base_tb_role_permissions_default } from "../../../schemas/base.role-permissions-default";
import getDbConnect from "../../../utils/getDbConnect";

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

    const db = getDbConnect();

    // Check if role exists
    const [existingRole] = await db
      .select()
      .from(base_tb_roles)
      .where(eq(base_tb_roles.id, id))
      .limit(1);

    if (!existingRole) {
      return JSONResponse({
        error: "Role not found",
        status: 404,
      });
    }

    // Check if another role with same code exists (excluding current role)
    const [duplicateRole] = await db
      .select()
      .from(base_tb_roles)
      .where(eq(base_tb_roles.code, code))
      .limit(1);

    if (duplicateRole && duplicateRole.id !== id) {
      return JSONResponse({
        error: "Role with this code already exists",
        status: 400,
      });
    }

    // Update role (preserve isSystem status, don't allow changing it)
    const [updatedRole] = await db
      .update(base_tb_roles)
      .set({
        code,
        name,
        description: description || null,
        updatedAt: new Date(),
      })
      .where(eq(base_tb_roles.id, id))
      .returning();

    // Update default permissions
    // First, delete existing permissions
    await db
      .delete(base_tb_role_permissions_default)
      .where(eq(base_tb_role_permissions_default.roleId, id));

    // Then, insert new permissions if provided
    if (
      permissionIds &&
      Array.isArray(permissionIds) &&
      permissionIds.length > 0
    ) {
      await db.insert(base_tb_role_permissions_default).values(
        permissionIds.map((permissionId: string) => ({
          roleId: id,
          permissionId,
          isActive: true,
        }))
      );
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
