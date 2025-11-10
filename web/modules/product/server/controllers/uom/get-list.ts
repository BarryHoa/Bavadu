import { getEnv } from "@base/server";
import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";

import { table_unit_of_measure } from "../../schemas";

export async function GET() {
  try {
    const env = getEnv();
    const db = env.getDb();

    const units = await db
      .select()
      .from(table_unit_of_measure)
      .orderBy(asc(table_unit_of_measure.name));

    return NextResponse.json({
      success: true,
      data: units.map((unit) => ({
        id: unit.id,
        name: unit.name,
        symbol: unit.symbol ?? undefined,
        isActive: unit.isActive,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch units of measure",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
