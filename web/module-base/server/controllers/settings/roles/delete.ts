import { JSONResponse } from "@base/server/utils/JSONResponse";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import getDbConnect from "../../../utils/getDbConnect";
import { base_tb_roles } from "../../../schemas/base.role";
import { base_tb_user_roles } from "../../../schemas/base.user-roles";

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

    const db = getDbConnect();

    // Check if role exists
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

    // Check if role is system role (cannot be deleted)
    if (role.isSystem) {
      return JSONResponse({
        error: "System roles cannot be deleted",
        status: 400,
      });
    }

    // Check if role is assigned to any users
    const userRoles = await db
      .select()
      .from(base_tb_user_roles)
      .where(eq(base_tb_user_roles.roleId, id))
      .limit(1);

    // Delete role (cascade will handle related records)
    await db.delete(base_tb_roles).where(eq(base_tb_roles.id, id));

    return JSONResponse({
      message: userRoles.length > 0 
        ? "Role deleted. Users with this role have been unassigned."
        : "Role deleted successfully",
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

