#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const MODULES_DIR = path.join(__dirname, "..", "modules");
const APP_DIR = path.join(__dirname, "..", "app");
const MODULE_REGISTRY = path.join(MODULES_DIR, "module.json");

class ModuleManager {
  constructor() {
    this.ensureModulesDir();
    this.loadRegistry();
  }

  ensureModulesDir() {
    if (!fs.existsSync(MODULES_DIR)) {
      fs.mkdirSync(MODULES_DIR, { recursive: true });
    }
  }

  loadRegistry() {
    if (fs.existsSync(MODULE_REGISTRY)) {
      this.registry = JSON.parse(fs.readFileSync(MODULE_REGISTRY, "utf8"));
    } else {
      this.registry = { modules: {}, installed: [], version: "1.0.0" };
      this.saveRegistry();
    }
  }

  saveRegistry() {
    fs.writeFileSync(MODULE_REGISTRY, JSON.stringify(this.registry, null, 2));
  }

  install(moduleName) {
    console.log(`Installing module: ${moduleName}`);

    const modulePath = path.join(MODULES_DIR, moduleName);
    const moduleConfigPath = path.join(modulePath, "module.json");

    if (!fs.existsSync(moduleConfigPath)) {
      throw new Error(`Module ${moduleName} not found`);
    }

    const moduleConfig = JSON.parse(fs.readFileSync(moduleConfigPath, "utf8"));

    // Check if already installed
    if (this.registry.installed.includes(moduleName)) {
      console.log(`Module ${moduleName} is already installed`);
      return;
    }

    // Auto-generate app routes if enabled
    if (moduleConfig.autoGenerate) {
      this.generateAppRoutes(moduleName, modulePath, moduleConfig);
    }

    // Add to registry
    this.registry.modules[moduleName] = moduleConfig;
    this.registry.installed.push(moduleName);
    this.saveRegistry();

    console.log(`✅ Module ${moduleName} installed successfully`);
  }

  uninstall(moduleName) {
    console.log(`Uninstalling module: ${moduleName}`);

    if (!this.registry.installed.includes(moduleName)) {
      console.log(`Module ${moduleName} is not installed`);
      return;
    }

    // Remove generated app routes
    const appModulePath = path.join(APP_DIR, moduleName);
    if (fs.existsSync(appModulePath)) {
      fs.rmSync(appModulePath, { recursive: true, force: true });
      console.log(`Removed app routes for ${moduleName}`);
    }

    // Remove from registry
    delete this.registry.modules[moduleName];
    this.registry.installed = this.registry.installed.filter(
      (name) => name !== moduleName
    );
    this.saveRegistry();

    console.log(`✅ Module ${moduleName} uninstalled successfully`);
  }

  generateAppRoutes(moduleName, modulePath, moduleConfig) {
    const appModulePath = path.join(APP_DIR, moduleName);
    const moduleAppPath = path.join(modulePath, "app");

    if (!fs.existsSync(moduleAppPath)) {
      console.log(`No app directory found in module ${moduleName}`);
      return;
    }

    // Create symlink or copy files
    if (fs.existsSync(appModulePath)) {
      fs.rmSync(appModulePath, { recursive: true, force: true });
    }

    // Copy module app to main app directory
    this.copyDirectory(moduleAppPath, appModulePath);
    console.log(`Generated app routes for ${moduleName}`);
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  list() {
    console.log("\n📦 Installed Modules:");
    if (this.registry.installed.length === 0) {
      console.log("  No modules installed");
    } else {
      this.registry.installed.forEach((moduleName) => {
        const module = this.registry.modules[moduleName];
        console.log(
          `  • ${moduleName} v${module.version} - ${module.description}`
        );
      });
    }
    console.log("");
  }

  create(moduleName, description = "") {
    console.log(`Creating module: ${moduleName}`);

    const modulePath = path.join(MODULES_DIR, moduleName);

    if (fs.existsSync(modulePath)) {
      throw new Error(`Module ${moduleName} already exists`);
    }

    // Create module directory structure
    fs.mkdirSync(modulePath, { recursive: true });
    fs.mkdirSync(path.join(modulePath, "app"), { recursive: true });
    fs.mkdirSync(path.join(modulePath, "components"), { recursive: true });
    fs.mkdirSync(path.join(modulePath, "lib"), { recursive: true });
    fs.mkdirSync(path.join(modulePath, "types"), { recursive: true });

    // Create module.json
    const moduleConfig = {
      name: moduleName,
      version: "1.0.0",
      description: description || `${moduleName} module`,
      author: "Bava Team",
      routes: [
        {
          path: `/${moduleName}`,
          component: "page.tsx",
        },
      ],
      dependencies: [],
      autoGenerate: true,
    };

    fs.writeFileSync(
      path.join(modulePath, "module.json"),
      JSON.stringify(moduleConfig, null, 2)
    );

    // Create basic page
    const pageContent = `export default function ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Page() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Module</h1>
      <p>Welcome to the ${moduleName} module!</p>
    </div>
  );
}`;

    fs.writeFileSync(path.join(modulePath, "app", "page.tsx"), pageContent);

    console.log(`✅ Module ${moduleName} created successfully`);
  }
}

// CLI Interface
const command = process.argv[2];
const moduleName = process.argv[3];
const description = process.argv[4];

const manager = new ModuleManager();

switch (command) {
  case "install":
    if (!moduleName) {
      console.error("Usage: npm run module:install <module_name>");
      process.exit(1);
    }
    manager.install(moduleName);
    break;

  case "uninstall":
    if (!moduleName) {
      console.error("Usage: npm run module:uninstall <module_name>");
      process.exit(1);
    }
    manager.uninstall(moduleName);
    break;

  case "list":
    manager.list();
    break;

  case "create":
    if (!moduleName) {
      console.error("Usage: npm run module:create <module_name> [description]");
      process.exit(1);
    }
    manager.create(moduleName, description);
    break;

  default:
    console.log(`
Bava Module Manager

Usage:
  npm run module:install <module_name>    Install a module
  npm run module:uninstall <module_name> Uninstall a module
  npm run module:list                    List installed modules
  npm run module:create <module_name>    Create a new module
`);
    break;
}
