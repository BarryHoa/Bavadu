import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { drizzle } from "drizzle-orm/postgres-js";
import { existsSync, readdirSync, readFileSync } from "fs";
import { dirname, join, relative } from "path";
import postgres from "postgres";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

type ModelFactoryElm = {
  instance: () => object;
  path: string;
  module: string;
  key: string;
  timestamp: string;
};
type SchemaRegistry = Record<string, unknown>;

interface EnvironmentOptions {
  projectRoot?: string;
}

class Environment {
  private readonly projectRoot: string;
  private db: ReturnType<typeof drizzle> | null = null;
  private readonly modelFactories = new Map<string, ModelFactoryElm>();

  private constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  static async create(options: EnvironmentOptions = {}): Promise<Environment> {
    const env = new Environment(options.projectRoot ?? process.cwd());
    await env.init();
    return env;
  }

  getDb(): ReturnType<typeof drizzle> {
    if (!this.db) {
      throw new Error("Database not initialized. Call create() first.");
    }

    return this.db;
  }

  getModel<T extends object>(modelId: string): T | undefined {
    const factoryElm = this.modelFactories.get(modelId);

    if (!factoryElm) {
      return undefined;
    }

    try {
      console.log(
        "Log load model: ",
        modelId,
        "created at: ",
        factoryElm.timestamp
      );
      const instance = factoryElm.instance();

      if (instance && typeof instance === "object") {
        return instance as T;
      }
    } catch (error) {
      console.error(
        `Failed to instantiate model "${modelId}"${factoryElm.path ? ` from ${factoryElm.path}` : ""}:`,
        error
      );
    }

    return undefined;
  }
  getAllModels(): ModelFactoryElm[] {
    return Array.from(this.modelFactories.values());
  }

  async reloadModel(modelId: string): Promise<boolean> {
    const factoryElm = this.modelFactories.get(modelId);
    if (!factoryElm) {
      console.warn(`Model "${modelId}" is not registered.`);
      return false;
    }

    const rootPath = [
      factoryElm.module === "base" ? "base" : "mdl",
      factoryElm.module === "base" ? undefined : factoryElm.module,
      "server",
      "models",
      factoryElm.path,
    ]
      .filter(Boolean)
      .join("/");

    try {
      const moduleSpecifier = `@${rootPath}`;
      const cacheBustedSpecifier = `${moduleSpecifier}?update=${Date.now()}`;
      const mod = await import(cacheBustedSpecifier);
      const ModelClass = mod?.default;
      if (!ModelClass) {
        throw new Error("Missing default export");
      }

      const factory = () => new ModelClass();
      this.registerOneModel(
        modelId,
        factoryElm.module,
        factory,
        factoryElm.path
      );

      return true;
    } catch (error) {
      console.error(
        `Failed to reload model "${modelId}"${factoryElm.path ? ` from ${factoryElm.path}` : ""}:`,
        error
      );
      return false;
    }
  }

  private async init(): Promise<void> {
    await this.registerModels();
    await this.registerDb();
  }

  private async registerModels(): Promise<void> {
    console.log("Registering models...");

    const moduleJsonPaths = this.collectModuleJsonPaths();
    let loadedCount = 0;
    let errorCount = 0;

    for (const moduleJsonPath of moduleJsonPaths) {
      const moduleDefinition = this.safeReadJson<{
        models?: Record<string, string>;
      }>(moduleJsonPath);
      const configuredModels = moduleDefinition?.models;
      if (!configuredModels) continue;

      for (const [modelId, fileName] of Object.entries(configuredModels)) {
        const pathToModelFile = join("server", "models", fileName);

        const modelPath = join(dirname(moduleJsonPath), pathToModelFile);
        const folderMdlRoot = this.resolveModuleName(moduleJsonPath);

        const folderName =
          folderMdlRoot === "module-base"
            ? "base"
            : (folderMdlRoot ?? "unknown-module");

        try {
          const mod = await import(this.toImportPath(modelPath));
          const ModelClass = mod?.default;
          if (!ModelClass) {
            throw new Error("Missing default export");
          }

          const factory = () => new ModelClass();
          this.registerOneModel(modelId, folderName, factory, fileName);
          loadedCount++;
        } catch (error) {
          errorCount++;
          console.error(
            `Failed to load model "${modelId}" from ${modelPath}:`,
            error
          );
        }
      }
    }

    console.log(
      `Model registry: ${loadedCount} loaded${errorCount ? `, ${errorCount} errors` : ""}`
    );
  }

  private async registerDb(): Promise<void> {
    console.log("Connecting to database...");

    const schemas: SchemaRegistry = {};
    const schemaEntryPoints = this.collectSchemaEntryPoints();

    for (const schemaPath of schemaEntryPoints) {
      try {
        const schemaModule = await import(this.toImportPath(schemaPath));
        Object.assign(schemas, schemaModule);
      } catch (error) {
        console.error(`Failed to load schema from ${schemaPath}:`, error);
      }
    }

    try {
      const client = this.createPgClient();
      this.db = drizzle(client, { schema: schemas });
      console.log("✅ DB connected with schema");
    } catch (error) {
      console.error("❌ DB connection failed:", error);
      throw error;
    }
  }

  private collectModuleJsonPaths(): string[] {
    const paths: string[] = [];

    const baseModuleJson = join(this.projectRoot, "module-base", "module.json");
    if (existsSync(baseModuleJson)) {
      paths.push(baseModuleJson);
    }

    const modulesRoot = join(this.projectRoot, "modules");
    for (const dir of this.safeReadDir(modulesRoot)) {
      const moduleJson = join(modulesRoot, dir, "module.json");
      if (existsSync(moduleJson)) {
        paths.push(moduleJson);
      }
    }

    return paths;
  }

  private collectSchemaEntryPoints(): string[] {
    const schemaPaths: string[] = [];

    const baseSchema = join(
      this.projectRoot,
      "module-base",
      "server",
      "schemas",
      "index.ts"
    );
    if (existsSync(baseSchema)) {
      schemaPaths.push(baseSchema);
    }

    const modulesRoot = join(this.projectRoot, "modules");
    for (const dir of this.safeReadDir(modulesRoot)) {
      const schemaPath = join(
        modulesRoot,
        dir,
        "server",
        "schemas",
        "index.ts"
      );
      if (existsSync(schemaPath)) {
        schemaPaths.push(schemaPath);
      }
    }

    return schemaPaths;
  }

  private safeReadDir(dirPath: string): string[] {
    if (!existsSync(dirPath)) return [];

    return readdirSync(dirPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  }

  private safeReadJson<T>(filePath: string): T | null {
    try {
      const raw = readFileSync(filePath, "utf8");
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`Failed to parse JSON from ${filePath}:`, error);
      return null;
    }
  }

  private toImportPath(targetPath: string): string {
    const relativePath = relative(this.projectRoot, targetPath).replace(
      /\\/g,
      "/"
    );
    return `@/${relativePath}`;
  }

  private registerOneModel(
    modelId: string,
    moduleName: string,
    factory: () => object,
    sourcePath: string
  ): void {
    const entry: ModelFactoryElm = {
      instance: factory,
      path: sourcePath,
      module: moduleName,
      key: modelId,
      timestamp: dayjs().toISOString(),
    };

    this.modelFactories.set(modelId, entry);

    try {
      factory();
    } catch (error) {
      console.error(
        `Model "${modelId}" threw during initialization${sourcePath ? ` from ${sourcePath}` : ""}:`,
        error
      );
      throw error;
    }
  }

  private resolveModuleName(moduleJsonPath: string): string {
    const moduleDir = dirname(moduleJsonPath);
    const relativeModuleDir = relative(this.projectRoot, moduleDir).replace(
      /\\/g,
      "/"
    );

    if (!relativeModuleDir || relativeModuleDir === ".") {
      return "root";
    }

    const segments = relativeModuleDir.split("/").filter(Boolean);
    return segments.pop() ?? relativeModuleDir;
  }

  private createPgClient() {
    const sslMode = process.env.PGSSLMODE || "disable";

    return postgres({
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
  }
}

export default Environment;
