import fs from "fs";
import path from "path";

export interface ModuleInfo {
  name: string;
  version: string;
  description: string;
  category: string;
  icon: string;
}

export interface ModuleRegistry {
  modules: Record<string, ModuleInfo>;
  installed: string[];
  available: ModuleInfo[];
  version: string;
  lastUpdated: string;
}

export class ModuleRegistryManager {
  private registryPath: string;
  private registry: ModuleRegistry;

  constructor() {
    this.registryPath = path.join(process.cwd(), "modules", "module.json");
    this.registry = this.loadRegistry();
  }

  private loadRegistry(): ModuleRegistry {
    if (fs.existsSync(this.registryPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.registryPath, "utf8"));
      } catch (error) {
        console.error("Error loading module registry:", error);
        return this.getDefaultRegistry();
      }
    }
    return this.getDefaultRegistry();
  }

  private getDefaultRegistry(): ModuleRegistry {
    return {
      modules: {},
      installed: [],
      available: [],
      version: "1.0.0",
      lastUpdated: new Date().toISOString().split("T")[0],
    };
  }

  private saveRegistry(): void {
    try {
      fs.writeFileSync(
        this.registryPath,
        JSON.stringify(this.registry, null, 2)
      );
    } catch (error) {
      console.error("Error saving module registry:", error);
    }
  }

  public getInstalledModules(): ModuleInfo[] {
    return this.registry.installed
      .map((id) => this.registry.modules[id])
      .filter(Boolean);
  }

  public getAvailableModules(): ModuleInfo[] {
    return this.registry.available;
  }

  public getAllModules(): ModuleInfo[] {
    return [...this.getInstalledModules(), ...this.getAvailableModules()];
  }

  public getModuleById(id: string): ModuleInfo | null {
    return (
      this.registry.modules[id] ||
      this.registry.available.find(
        (m) => m.name.toLowerCase().replace(/\s+/g, "") === id
      ) ||
      null
    );
  }

  public isModuleInstalled(moduleId: string): boolean {
    return this.registry.installed.includes(moduleId);
  }

  public installModule(moduleId: string): boolean {
    const availableModule = this.registry.available.find(
      (m) => m.name.toLowerCase().replace(/\s+/g, "") === moduleId
    );
    if (!availableModule) {
      return false;
    }

    // Add to installed modules
    this.registry.modules[moduleId] = availableModule;
    this.registry.installed.push(moduleId);
    this.saveRegistry();
    return true;
  }

  public uninstallModule(moduleId: string): boolean {
    if (!this.isModuleInstalled(moduleId)) {
      return false;
    }

    // Remove from installed modules
    delete this.registry.modules[moduleId];
    this.registry.installed = this.registry.installed.filter(
      (id) => id !== moduleId
    );
    this.saveRegistry();
    return true;
  }

  public getModulesByCategory(category: string): ModuleInfo[] {
    return this.getAllModules().filter(
      (module) => module.category === category
    );
  }

  public searchModules(query: string): ModuleInfo[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllModules().filter(
      (module) =>
        module.name.toLowerCase().includes(lowercaseQuery) ||
        module.description.toLowerCase().includes(lowercaseQuery) ||
        module.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  public getStats() {
    const installed = this.getInstalledModules();
    const available = this.getAvailableModules();

    return {
      total: installed.length + available.length,
      installed: installed.length,
      available: available.length,
      categories: Array.from(
        new Set(this.getAllModules().map((m) => m.category))
      ).length,
    };
  }

  public getCategories(): string[] {
    return Array.from(new Set(this.getAllModules().map((m) => m.category)));
  }

  public refreshRegistry(): void {
    this.registry = this.loadRegistry();
  }
}

// Singleton instance
export const moduleRegistry = new ModuleRegistryManager();
