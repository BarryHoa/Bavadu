import { loadMenusFromModules } from "@/lib/menu-loader";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const menus = loadMenusFromModules();

    return NextResponse.json({
      success: true,
      data: menus,
      message: `Loaded ${menus.length} module(s) menu`,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error loading menus:", error);

    return NextResponse.json(
      {
        success: false,
        data: [],
        error: "Failed to load menus",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
