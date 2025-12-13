import { JSONResponse } from "@base/server/utils/JSONResponse";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import getDbConnect from "../../../utils/getDbConnect";
import { base_tb_roles } from "../../../schemas/base.role";
import { base_tb_role_permissions_default } from "../../../schemas/base.role-permissions-default";
import { base_tb_permissions } from "../../../schemas/base.permission";

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

    const db = getDbConnect();

    // Get role
    const [role] = await db
      .select()
      .from(base_tb_roles)
      .where(eq(base_tb_roles.id, id))
      .limit(1);

    if (!role) {
      return JSONResponse({
        error: "Role not found",
        status: 404,
      });
    }

    // Get default permissions for this role
    const rolePermissions = await db
      .select({
        id: base_tb_permissions.id,
        key: base_tb_permissions.key,
        module: base_tb_permissions.module,
        resource: base_tb_permissions.resource,
        action: base_tb_permissions.action,
        name: base_tb_permissions.name,
        description: base_tb_permissions.description,
      })
      .from(base_tb_role_permissions_default)
      .innerJoin(
        base_tb_permissions,
        eq(
          base_tb_role_permissions_default.permissionId,
          base_tb_permissions.id
        )
      )
      .where(eq(base_tb_role_permissions_default.roleId, id));

    return JSONResponse({
      data: {
        ...role,
        permissions: rolePermissions,
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

