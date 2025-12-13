import { JSONResponse } from "@base/server/utils/JSONResponse";
import { eq } from "drizzle-orm";
import getDbConnect from "../../../utils/getDbConnect";
import { base_tb_roles } from "../../../schemas/base.role";

export async function GET() {
  try {
    const db = getDbConnect();
    
    const roles = await db
      .select()
      .from(base_tb_roles)
      .orderBy(base_tb_roles.createdAt);

    return JSONResponse({
      data: roles,
      total: roles.length,
      message: `Loaded ${roles.length} role(s)`,
      status: 200,
    });
  } catch (error) {
    console.error("Error loading roles:", error);
    return JSONResponse({
      data: [],
      error: "Failed to load roles",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}

