import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

function saveRegistry(registry: ModuleRegistry): void {
  try {
    fs.writeFileSync(MODULE_REGISTRY_PATH, JSON.stringify(registry, null, 2));
  } catch (error) {
    console.error("Error saving module registry:", error);
  }
}

export async function GET() {
  try {
    const registry = loadRegistry();
    return NextResponse.json(registry);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load modules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, moduleId } = await request.json();
    const registry = loadRegistry();

    if (action === "install") {
      const availableModule = registry.available.find(
        (m) => m.name.toLowerCase().replace(/\s+/g, "") === moduleId
      );

      if (!availableModule) {
        return NextResponse.json(
          { error: "Module not found" },
          { status: 404 }
        );
      }

      registry.modules[moduleId] = availableModule;
      registry.installed.push(moduleId);
      saveRegistry(registry);

      return NextResponse.json({ success: true, module: availableModule });
    }

    if (action === "uninstall") {
      if (!registry.installed.includes(moduleId)) {
        return NextResponse.json(
          { error: "Module not installed" },
          { status: 404 }
        );
      }

      delete registry.modules[moduleId];
      registry.installed = registry.installed.filter((id) => id !== moduleId);
      saveRegistry(registry);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
