import fs from "fs";
import path from "path";

export interface ModuleConfig {
  name: string;
  version: string;
  description: string;
  author: string;
  routes: Array<{
    path: string;
    component: string;
  }>;
  dependencies: string[];
  autoGenerate: boolean;
}

export interface ModuleRegistry {
  modules: Record<string, ModuleConfig>;
  installed: string[];
  version: string;
}

export class ModuleLoader {
  private modulesDir: string;
  private registryPath: string;
  private registry: ModuleRegistry;

  constructor() {
    this.modulesDir = path.join(process.cwd(), "modules");
    this.registryPath = path.join(this.modulesDir, "module.json");
    this.registry = this.loadRegistry();
  }

  private loadRegistry(): ModuleRegistry {
    if (fs.existsSync(this.registryPath)) {
      return JSON.parse(fs.readFileSync(this.registryPath, "utf8"));
    }

    return { modules: {}, installed: [], version: "1.0.0" };
  }

  private saveRegistry(): void {
    fs.writeFileSync(this.registryPath, JSON.stringify(this.registry, null, 2));
  }

  public getInstalledModules(): string[] {
    return this.registry.installed;
  }

  public getModuleConfig(moduleName: string): ModuleConfig | null {
    return this.registry.modules[moduleName] || null;
  }

  public getAllModules(): Record<string, ModuleConfig> {
    return this.registry.modules;
  }

  public isModuleInstalled(moduleName: string): boolean {
    return this.registry.installed.includes(moduleName);
  }

  public getModuleRoutes(): Array<{
    path: string;
    component: string;
    module: string;
  }> {
    const routes: Array<{ path: string; component: string; module: string }> =
      [];

    for (const moduleName of this.registry.installed) {
      const moduleInfo = this.registry.modules[moduleName];

      if (moduleInfo && moduleInfo.routes) {
        moduleInfo.routes.forEach((route) => {
          routes.push({
            path: route.path,
            component: route.component,
            module: moduleName,
          });
        });
      }
    }

    return routes;
  }

  public getModuleComponents(): Record<string, string> {
    const components: Record<string, string> = {};

    for (const moduleName of this.registry.installed) {
      const modulePath = path.join(this.modulesDir, moduleName);
      const componentsPath = path.join(modulePath, "components");

      if (fs.existsSync(componentsPath)) {
        const componentFiles = this.getComponentFiles(componentsPath);

        componentFiles.forEach((file) => {
          const componentName = path.basename(file, path.extname(file));

          components[`${moduleName}/${componentName}`] = path.relative(
            process.cwd(),
            file,
          );
        });
      }
    }

    return components;
  }

  private getComponentFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...this.getComponentFiles(fullPath));
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))
      ) {
        files.push(fullPath);
      }
    }

    return files;
  }

  public getModuleTypes(): Record<string, string> {
    const types: Record<string, string> = {};

    for (const moduleName of this.registry.installed) {
      const modulePath = path.join(this.modulesDir, moduleName);
      const typesPath = path.join(modulePath, "types");

      if (fs.existsSync(typesPath)) {
        const typeFiles = this.getTypeFiles(typesPath);

        typeFiles.forEach((file) => {
          const typeName = path.basename(file, path.extname(file));

          types[`${moduleName}/${typeName}`] = path.relative(
            process.cwd(),
            file,
          );
        });
      }
    }

    return types;
  }

  private getTypeFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...this.getTypeFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".ts")) {
        files.push(fullPath);
      }
    }

    return files;
  }

  public getModuleLibs(): Record<string, string> {
    const libs: Record<string, string> = {};

    for (const moduleName of this.registry.installed) {
      const modulePath = path.join(this.modulesDir, moduleName);
      const libPath = path.join(modulePath, "lib");

      if (fs.existsSync(libPath)) {
        const libFiles = this.getLibFiles(libPath);

        libFiles.forEach((file) => {
          const libName = path.basename(file, path.extname(file));

          libs[`${moduleName}/${libName}`] = path.relative(process.cwd(), file);
        });
      }
    }

    return libs;
  }

  private getLibFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...this.getLibFiles(fullPath));
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))
      ) {
        files.push(fullPath);
      }
    }

    return files;
  }
}

// Singleton instance
export const moduleLoader = new ModuleLoader();
