import dayjs from "dayjs";
import { getLogModel } from "../models/Logs/LogModel";
import { ConfigManager } from "./ConfigManager";
import { ConnectionPool } from "./ConnectionPool";
import { ModelInstance } from "./ModelInstance";
import type { RuntimeContextState } from "./types";

/**
 * Runtime Context Manager
 * - Singleton with promise lock to guard initialization
 * - Provides shared connection pool + model instance
 */
export class RuntimeContext {
  private static instance: RuntimeContext | null = null;
  private initPromise: Promise<void> | null = null;
  private isInitialized = false;
  private state: RuntimeContextState | null = null;
  private readonly projectRoot: string;

  private constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  static getInstance(projectRoot?: string): RuntimeContext {
    if (!this.instance) {
      this.instance = new RuntimeContext(projectRoot);
    }
    return this.instance;
  }

  static async getDbConnect(
    key: string = "primary"
  ): Promise<
    import("drizzle-orm/postgres-js").PostgresJsDatabase<Record<string, never>>
  > {
    const context = this.getInstance();
    await context.ensureInitialized();
    const pool = context.getConnectionPool();
    return pool.getConnection(key);
  }

  static async getModelInstance(): Promise<ModelInstance> {
    const context = this.getInstance();
    await context.ensureInitialized();
    return context.getModelInstance();
  }

  static async getModelInstanceBy<T extends object>(
    modelId: string
  ): Promise<T | undefined> {
    const context = this.getInstance();
    await context.ensureInitialized();
    const modelInstance = context.getModelInstance();
    return modelInstance.getModel<T>(modelId);
  }

  async ensureInitialized(): Promise<void> {
    if (this.isInitialized && this.state) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initialize();

    try {
      await this.initPromise;
      this.isInitialized = true;
    } catch (error) {
      // Reset promise on failure to allow retry
      this.initPromise = null;
      throw error;
    }
  }

  private async _initialize(): Promise<void> {
    const isDev = process.env.NODE_ENV !== "production";
    const log = (...args: any[]) =>
      isDev ? console.log("[RuntimeContext]", ...args) : undefined;

    try {
      getLogModel();
      log("Logging system initialized");

      log("Creating connection pool...");
      const connectionPool = new ConnectionPool(this.projectRoot);
      log("Connection pool created, initializing...");
      await connectionPool.initialize();
      log("Connection pool initialized");

      log("Creating model instance...");
      const modelInstance = await ModelInstance.create({
        projectRoot: this.projectRoot,
      });
      log("Model instance created");

      log("Loading configuration...");
      const configManager = ConfigManager.getInstance();
      await configManager.load();
      log("Configuration loaded");

      this.state = {
        connectionPool,
        modelInstance,
        initializedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      };

      log("Initialization completed", {
        hasState: !!this.state,
        hasConnectionPool: !!this.state?.connectionPool,
        hasModelInstance: !!this.state?.modelInstance,
      });
    } catch (error) {
      console.error("[RuntimeContext] Error during initialization:", error);
      console.error(
        "[RuntimeContext] Error stack:",
        error instanceof Error ? error.stack : "No stack"
      );
      throw error;
    }
  }

  private _ensureState(): RuntimeContextState {
    if (!this.isInitialized || !this.state) {
      throw new Error(
        "Runtime not initialized. Call ensureInitialized() first."
      );
    }
    return this.state;
  }

  getConnectionPool(): ConnectionPool {
    return this._ensureState().connectionPool;
  }

  getModelInstance(): ModelInstance {
    return this._ensureState().modelInstance;
  }

  getEnvironment(): ModelInstance {
    return this.getModelInstance();
  }

  getConfigManager(): ConfigManager {
    return ConfigManager.getInstance();
  }

  getInitializationState(): boolean {
    return this.isInitialized;
  }

  getState(): RuntimeContextState | null {
    return this.state;
  }

  reset(): void {
    this.initPromise = null;
    this.isInitialized = false;
    this.state = null;
    ConfigManager.getInstance().reset();
  }

  updateTimestamp(): void {
    if (this.state) {
      const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
      this.state.initializedAt = timestamp;
    }
  }
}
