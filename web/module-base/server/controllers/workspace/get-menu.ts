import { JSONResponse } from "@base/server/utils/JSONResponse";
import { loadAllMenus } from "../../loaders/menu-loader";

export async function GET() {
  try {
    const menus = loadAllMenus();
    return JSONResponse({
      data: menus,
      message: `Loaded ${menus.length} menu(s)`,
      status: 200,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error loading menus:", error);

    return JSONResponse({
      data: [],
      error: "Failed to load menus",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
