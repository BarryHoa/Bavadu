import fs from "fs";
import path from "path";
import modelSystemStore from "../models/ModelSystemStore";

/**
 * AutoLoadModel - Automatically loads all model instances when app starts
 * Scans modules directory and loads all models that extend BaseModel
 */
class AutoLoadModel {
  private modulesDir: string;
  private loadedModels: Set<string> = new Set();

  constructor() {
    this.modulesDir = path.join(process.cwd(), "modules");
    this.loadModels();
  }

  /**
   * Recursively find all files matching pattern *Model.ts
   */
  private findModelFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively search in subdirectories
        this.findModelFiles(filePath, fileList);
      } else if (stat.isFile() && file.endsWith("Model.ts")) {
        // Found a Model.ts file
        fileList.push(filePath);
      }
    }

    return fileList;
  }

  /**
   * Scan and load all models from modules directory
   * Finds all files matching *Model.ts pattern
   */
  private loadModels() {
    console.group("🚀 Auto-loading models...");

    if (!fs.existsSync(this.modulesDir)) {
      console.log("⚠️  Modules directory not found, skipping model auto-load");
      console.groupEnd();
      return;
    }

    const moduleNames = fs
      .readdirSync(this.modulesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    let loadedCount = 0;
    let errorCount = 0;

    for (const moduleName of moduleNames) {
      const modelsDir = path.join(
        this.modulesDir,
        moduleName,
        "server",
        "models"
      );

      if (!fs.existsSync(modelsDir)) {
        continue;
      }

      // Find all *Model.ts files recursively
      const modelFiles = this.findModelFiles(modelsDir);

      for (const modelFilePath of modelFiles) {
        try {
          // Get relative path from modelsDir
          const relativePath = path.relative(modelsDir, modelFilePath);
          const modelPathWithoutExt = relativePath.replace(/\.ts$/, "");

          this.loadModelFromFile(
            moduleName,
            modelPathWithoutExt,
            modelFilePath
          );
          // Count as registered (even though not loaded yet)
          loadedCount++;
        } catch (error) {
          console.error(
            `❌ Failed to load model from ${modelFilePath}:`,
            error instanceof Error ? error.message : error
          );
          errorCount++;
        }
      }
    }

    console.log(
      `✅ Auto-loaded ${loadedCount} models${errorCount > 0 ? ` (${errorCount} errors)` : ""}`
    );
    console.log(
      `📦 Model store contains ${modelSystemStore.size()} model(s)`,
      modelSystemStore.getAllKeys()
    );
    console.groupEnd();
  }

  /**
   * Load a model from a file path using require (server-side only)
   * Using require instead of dynamic import to avoid webpack issues
   */
  private loadModelFromFile(
    moduleName: string,
    modelPathWithoutExt: string,
    filePath: string
  ) {
    // Extract model name from file path
    // Example: ProductModel/ProductModel.ts -> ProductModel
    const fileName = path.basename(filePath, ".ts");
    const modelName = fileName; // Use file name as model name

    // Default modelId format: module.ModelName
    const modelId = `${moduleName}.${modelName}`;

    try {
      // Skip if already registered
      if (this.loadedModels.has(modelId)) {
        return;
      }

      // In Next.js with Turbopack, we can't use require() or dynamic imports
      // with computed paths during module initialization
      // Instead, we'll just register the model path and load it on-demand
      // Models will be loaded when actually used via the loadModel function in controllers

      // Store the model info for on-demand loading
      const aliasPath = `@mdl/${moduleName}/server/models/${modelPathWithoutExt.replace(/\\/g, "/")}`;

      // Just register the model path mapping, don't load it now
      // The model will be loaded on-demand when actually needed
      console.log(`  📝 Registered model path: ${modelId} -> ${aliasPath}`);

      // Mark as registered (but not loaded yet)
      this.loadedModels.add(modelId);

      // Don't actually load the model instance here
      // It will be loaded on-demand via dynamic import in the controller
      // when the model is actually needed (e.g., when calling an API that uses it)
    } catch (error) {
      console.warn(
        `⚠️  Failed to register model ${modelId}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get custom modelId from model instance
   * Checks in order:
   * 1. Static MODEL_ID property on model class
   * 2. Instance getModelId() method
   * 3. Returns null to use default format
   */
  private getCustomModelId(
    modelInstance: any,
    moduleName: string,
    modelName: string
  ): string | null {
    // Check static MODEL_ID property
    const ModelClass = modelInstance.constructor;
    if (ModelClass && typeof ModelClass.MODEL_ID === "string") {
      const staticId = ModelClass.MODEL_ID;
      // If it contains a dot, use as-is (full format like "module.model")
      // Otherwise, prepend module name
      if (staticId.includes(".")) {
        return staticId;
      }
      return `${moduleName}.${staticId}`;
    }

    // Check instance getModelId() method
    if (
      typeof modelInstance.getModelId === "function" &&
      modelInstance.getModelId()
    ) {
      const instanceId = modelInstance.getModelId();
      if (typeof instanceId === "string") {
        // If it contains a dot, use as-is
        // Otherwise, prepend module name
        if (instanceId.includes(".")) {
          return instanceId;
        }
        return `${moduleName}.${instanceId}`;
      }
    }

    return null;
  }

  /**
   * Get count of loaded models
   */
  public getLoadedCount(): number {
    return this.loadedModels.size;
  }

  /**
   * Get list of loaded model IDs
   */
  public getLoadedModels(): string[] {
    return Array.from(this.loadedModels);
  }
}

// Create and export instance - this will run the constructor and load all models
const autoLoadModel = new AutoLoadModel();

export default autoLoadModel;
