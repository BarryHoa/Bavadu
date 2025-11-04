import { drizzle } from "drizzle-orm/postgres-js";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join, relative } from "path";
import postgres from "postgres";

class Environment {
  private db: ReturnType<typeof drizzle> | null = null;
  private models = new Map<string, any>();
  constructor() {
    this.init();
  }

  private async registerModels(): Promise<void> {
    console.group("Registering models...");
    const rootDir = process.cwd();
    const modulesRoot = join(rootDir, "modules");
    const moduleJsonPaths: string[] = [];

    // Find module.json files
    const baseModuleJson = join(rootDir, "module-base", "module.json");
    if (existsSync(baseModuleJson)) moduleJsonPaths.push(baseModuleJson);

    if (existsSync(modulesRoot)) {
      for (const dirName of readdirSync(modulesRoot)) {
        const candidateDir = join(modulesRoot, dirName);
        if (!statSync(candidateDir).isDirectory()) continue;
        const jsonPath = join(candidateDir, "module.json");
        if (existsSync(jsonPath)) moduleJsonPaths.push(jsonPath);
      }
    }

    let loadedCount = 0;
    let errorCount = 0;

    for (const moduleJsonPath of moduleJsonPaths) {
      let moduleJson: { models?: Record<string, string> };
      try {
        moduleJson = JSON.parse(readFileSync(moduleJsonPath, "utf8"));
      } catch {
        continue;
      }

      const models = moduleJson?.models;
      if (!models || typeof models !== "object" || Array.isArray(models)) {
        continue;
      }

      const moduleDir = dirname(moduleJsonPath);

      for (const [modelId, fileName] of Object.entries(models)) {
        const filePath = join(moduleDir, "server/models", fileName);
        const relFromCwd = `@/${relative(rootDir, filePath).replace(/\\/g, "/")}`;

        try {
          const mod = await import(relFromCwd);
          const ModelClass = mod?.default;
          if (!ModelClass) {
            errorCount++;
            continue;
          }

          const modelInstance = new ModelClass();
          this.models.set(modelId, modelInstance);
          loadedCount++;
        } catch (error) {
          console.error(`Failed to load ${modelId} from ${relFromCwd}:`, error);
          errorCount++;
        }
      }
    }

    console.log(
      `Model registry: ${loadedCount} loaded${errorCount ? `, ${errorCount} errors` : ""}`
    );
    console.groupEnd();
  }
  private async registerDb(): Promise<void> {
    console.group("Connecting to database...");
    try {
      const sslMode = process.env.PGSSLMODE || "disable";
      const client = postgres({
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        ssl: sslMode === "require" ? "require" : undefined,
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
      });

      this.db = drizzle(client);
      console.log("DB connected");
    } catch (error) {
      console.error("DB connection failed:", error);
      throw error;
    }
    console.groupEnd();
  }

  private async init(): Promise<void> {
    await this.registerModels();
    await this.registerDb();
  }

  getDb(): ReturnType<typeof drizzle> {
    if (!this.db) {
      throw new Error("Database not initialized. Call init() first.");
    }
    return this.db;
  }

  getModel(modelId: string): any {
    return this.models.get(modelId);
  }
}
export default Environment;
