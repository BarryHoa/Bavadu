import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";

const MODULE_REGISTRY_PATH = path.join(process.cwd(), "modules", "module.json");

interface ModuleInfo {
  name: string;
  version: string;
  description: string;
  category: string;
  icon: string;
}

interface ModuleRegistry {
  modules: Record<string, ModuleInfo>;
  installed: string[];
  available: ModuleInfo[];
  version: string;
}

function loadRegistry(): ModuleRegistry {
  if (fs.existsSync(MODULE_REGISTRY_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(MODULE_REGISTRY_PATH, "utf8"));
    } catch (error) {
      console.error("Error loading module registry:", error);

      return getDefaultRegistry();
    }
  }

  return getDefaultRegistry();
}

function getDefaultRegistry(): ModuleRegistry {
  return {
    modules: {},
    installed: [],
    available: [],
    version: "1.0.0",
  };
}

export async function GET() {
  try {
    const registry = loadRegistry();
    // Return only installed modules
    const installedModules = registry.installed
      .map((id) => registry.modules[id])
      .filter(Boolean);

    return NextResponse.json(installedModules);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load installed modules" },
      { status: 500 },
    );
  }
}
