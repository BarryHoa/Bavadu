import { JSONResponse } from "@base/server/utils/JSONResponse";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import getDbConnect from "../../../utils/getDbConnect";
import { base_tb_roles } from "../../../schemas/base.role";
import { base_tb_role_permissions_default } from "../../../schemas/base.role-permissions-default";

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

    const db = getDbConnect();

    // Check if role with same code already exists
    const [existingRole] = await db
      .select()
      .from(base_tb_roles)
      .where(eq(base_tb_roles.code, code))
      .limit(1);

    if (existingRole) {
      return JSONResponse({
        error: "Role with this code already exists",
        status: 400,
      });
    }

    // Create role (always set isSystem to false)
    const [newRole] = await db
      .insert(base_tb_roles)
      .values({
        code,
        name,
        description: description || null,
        isSystem: false, // Always false for new roles
        isActive: true,
      })
      .returning();

    // Add default permissions if provided
    if (permissionIds && Array.isArray(permissionIds) && permissionIds.length > 0) {
      await db.insert(base_tb_role_permissions_default).values(
        permissionIds.map((permissionId: string) => ({
          roleId: newRole.id,
          permissionId,
          isActive: true,
        }))
      );
    }

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

