import { drizzle } from "drizzle-orm/postgres-js";
import * as fs from "fs";
import isEmpty from "lodash/isEmpty";
import * as path from "path";
import postgres from "postgres";

class Environment {
  private db: ReturnType<any> | null = null;
  private models = new Map<string, any>();
  constructor() {
    // Create connection using standard PostgreSQL environment variables
    // this.models = ;
    // this.init();
  }

  // Auto-scan and register all *Model.ts from modules/**
  private registerModels = async () => {
    console.group("Registering models...");
    const rootDir = process.cwd();
    const modulesRoot = path.join(rootDir, "modules");

    // Step 1: find module.json at '@base/module.json' and '@mdl/module-name/module.json'
    const moduleJsonPaths: string[] = [];
    const baseModuleJson = path.join(rootDir, "module-base", "module.json");
    if (fs.existsSync(baseModuleJson)) moduleJsonPaths.push(baseModuleJson);
    if (fs.existsSync(modulesRoot)) {
      for (const dirName of fs.readdirSync(modulesRoot)) {
        const candidateDir = path.join(modulesRoot, dirName);
        if (!fs.statSync(candidateDir).isDirectory()) continue;
        const jsonPath = path.join(candidateDir, "module.json");
        if (fs.existsSync(jsonPath)) moduleJsonPaths.push(jsonPath);
      }
    }

    let loadedCount = 0;
    let errorCount = 0;

    // Helper: recursively find first file that matches fileName (without extension) inside a module directory
    const findModelFileRecursively = (
      startDir: string,
      fileBaseName: string
    ): string | null => {
      const stack: string[] = [startDir];
      while (stack.length) {
        const current = stack.pop() as string;
        if (!fs.existsSync(current)) continue;
        const entries = fs.readdirSync(current);
        for (const entry of entries) {
          const fullPath = path.join(current, entry);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            stack.push(fullPath);
            // Also check index.ts inside a folder named like the model
            if (entry === fileBaseName) {
              const indexTs = path.join(fullPath, "index.ts");
              if (fs.existsSync(indexTs)) return indexTs;
            }
          } else if (stat.isFile()) {
            if (entry === `${fileBaseName}.ts`) return fullPath;
          }
        }
      }
      return null;
    };

    for (const moduleJsonPath of moduleJsonPaths) {
      let moduleJson: any = null;
      try {
        moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, "utf8"));
      } catch (_err) {
        continue;
      }

      // Step 2-3: read and validate models
      const models = moduleJson?.models;
      // const isObjectMap = models && typeof models === "object" && !Array.isArray(models);
      const isEmptyModels = isEmpty(models);

      // console.log("isEmptyModels", isEmptyModels, models);
      if (isEmptyModels) continue;

      // Determine this module's root directory
      const moduleDir = path.dirname(moduleJsonPath);

      // console.log("models", moduleDir);
      // Step 4-6: iterate key -> value and import file, then set instance
      for (const [modelId, fileName] of Object.entries(
        models as Record<string, any>
      )) {
        const filePath = path.join(moduleDir, "server/models", fileName);
        const relFromCwd = `@/${path.relative(rootDir, filePath).replace(/\\/g, "/")}`;

        try {
          const mod = await import(relFromCwd);
          const modclass = mod?.default ?? null;
          if (!modclass) {
            errorCount++;
            continue;
          }
          const modelInstance = new modclass(modelId);
          this.setModel(modelId, modelInstance);

          loadedCount++;
        } catch (error) {
          console.error(`Failed: ${modelId}: ${relFromCwd}`);
          errorCount++;
        }
      }
    }
    console.log(
      `Model registry: ${loadedCount} loaded${errorCount ? `, ${errorCount} errors` : ""}`
    );
    console.groupEnd();
  };
  registerDb = async () => {
    console.group("Connecting to database...");
    try {
      const sslMode = process.env.PGSSLMODE || "disable";
      const host = process.env.PGHOST || "localhost";
      const port = Number(process.env.PGPORT || 5432);
      const user = process.env.PGUSER || undefined;
      const password = process.env.PGPASSWORD || undefined;
      const database = process.env.PGDATABASE || undefined;

      const client = postgres({
        host,
        port,
        user,
        password,
        database,
        ssl: sslMode === "require" ? "require" : undefined,
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
      });

      // Create Drizzle instance
      const db = drizzle(client, {});
      this.db = db;
      console.log("DB connected");
    } catch (error) {
      console.error("DB connection failed:", error);
    }
    console.groupEnd();
  };
  init = async () => {
    await this.registerModels();
    await this.registerDb();
  };

  getDb(): any {
    return this.db;
  }

  hasModel(modelId: string): boolean {
    return this.models.has(modelId);
  }

  getModelKeys(): string[] {
    return Array.from(this.models.keys());
  }

  getModelSize(): number {
    return this.models.size || 0;
  }

  getModel(modelId: string): any {
    return this.models.get(modelId);
  }

  setModel(modelId: string, model: any): void {
    this.models.set(modelId, model);
  }
}

// Singleton instance
let envInstance: Environment | null = null;

function getEnv(): Environment {
  if (!envInstance) {
    envInstance = new Environment();
  }
  return envInstance;
}

// Export default for convenience
export default getEnv;

// Export Environment class for advanced usage
export { Environment };
