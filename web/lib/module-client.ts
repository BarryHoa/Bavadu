import { moduleRegistry, type ModuleInfo } from "./module-registry";

const toModuleId = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const installedModuleIds = new Set(
  moduleRegistry.map((module) => toModuleId(module.name))
);

export const moduleClient = {
  async getInstalledModules(): Promise<ModuleInfo[]> {
    return moduleRegistry.filter((module) =>
      installedModuleIds.has(toModuleId(module.name))
    );
  },

  async uninstallModule(moduleId: string): Promise<boolean> {
    if (!installedModuleIds.has(moduleId)) {
      return false;
    }

    installedModuleIds.delete(moduleId);
    return true;
  },

  searchModules(searchTerm: string, modules: ModuleInfo[]): ModuleInfo[] {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return modules;
    }

    return modules.filter((module) => {
      const haystack = [module.name, module.description, module.category]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  },
};

export type { ModuleInfo };
