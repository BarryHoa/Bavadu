import getDbConnect from "@base/server/utils/getDbConnect";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { asc } from "drizzle-orm";

import { table_unit_of_measure } from "../../schemas";

export async function GET() {
  try {
    const db = getDbConnect();

    const units = await db
      .select()
      .from(table_unit_of_measure)
      .orderBy(asc(table_unit_of_measure.name));

    return JSONResponse({
      data: units.map((unit) => ({
        id: unit.id,
        name: unit.name,
        symbol: unit.symbol ?? undefined,
        isActive: unit.isActive,
      })),
      status: 200,
    });
  } catch (error) {
    return JSONResponse({
      error: "Failed to fetch units of measure",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
