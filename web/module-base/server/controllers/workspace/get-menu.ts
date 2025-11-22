import { NextResponse } from "next/server";
import { loadAllMenus } from "../../loaders/menu-loader";

export async function GET() {
  try {
    const menus = loadAllMenus();
    return NextResponse.json({
      success: true,
      data: menus,
      message: `Loaded ${menus.length} menu(s)`,
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
