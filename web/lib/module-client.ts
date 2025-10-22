import { ModuleInfo } from "./module-registry";

export class ModuleClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "/api/modules";
  }

  async getInstalledModules(): Promise<ModuleInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/installed`);
      if (!response.ok) {
        throw new Error("Failed to fetch installed modules");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching installed modules:", error);
      return [];
    }
  }

  async them(): Promise<{
    modules: Record<string, ModuleInfo>;
    installed: string[];
    available: ModuleInfo[];
    version: string;
  }> {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch modules");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching modules:", error);
      return {
        modules: {},
        installed: [],
        available: [],
        version: "1.0.0",
      };
    }
  }

  async installModule(moduleId: string): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "install",
          moduleId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to install module");
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error installing module:", error);
      return false;
    }
  }

  async uninstallModule(moduleId: string): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "uninstall",
          moduleId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to uninstall module");
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error uninstalling module:", error);
      return false;
    }
  }

  getCategories(modules: ModuleInfo[]): string[] {
    return Array.from(new Set(modules.map((m) => m.category)));
  }

  searchModules(query: string, modules: ModuleInfo[]): ModuleInfo[] {
    const lowercaseQuery = query.toLowerCase();
    return modules.filter(
      (module) =>
        module.name.toLowerCase().includes(lowercaseQuery) ||
        module.description.toLowerCase().includes(lowercaseQuery) ||
        module.category.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Singleton instance
export const moduleClient = new ModuleClient();
