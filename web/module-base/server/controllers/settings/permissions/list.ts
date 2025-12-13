import { JSONResponse } from "@base/server/utils/JSONResponse";
import { eq } from "drizzle-orm";
import getDbConnect from "../../../utils/getDbConnect";
import { base_tb_permissions } from "../../../schemas/base.permission";

export async function GET() {
  try {
    const db = getDbConnect();
    
    const permissions = await db
      .select()
      .from(base_tb_permissions)
      .where(eq(base_tb_permissions.isActive, true))
      .orderBy(base_tb_permissions.module, base_tb_permissions.resource, base_tb_permissions.action);

    return JSONResponse({
      data: permissions,
      total: permissions.length,
      message: `Loaded ${permissions.length} permission(s)`,
      status: 200,
    });
  } catch (error) {
    console.error("Error loading permissions:", error);
    return JSONResponse({
      data: [],
      error: "Failed to load permissions",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}

