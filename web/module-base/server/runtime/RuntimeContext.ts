import dayjs from "dayjs";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { getLogModel } from "../models/Logs/LogModel";
import { ConfigManager } from "./ConfigManager";
import { ConnectionPool } from "./ConnectionPool";
import { ModelInstance } from "./ModelInstance";
import type { RuntimeContextState } from "./types";

/**
 * Runtime Context Manager
 * - Singleton with promise lock to guard initialization
 * - Provides shared connection pool + model registry
 */
export class RuntimeContext {
  // ---------------------------------------------------------------------------
  // Static singleton + convenience helpers
  // ---------------------------------------------------------------------------
  private static instance: RuntimeContext | null = null;
  private initPromise: Promise<void> | null = null;
  private isInitialized = false;
  private state: RuntimeContextState | null = null;
  private readonly projectRoot: string;

  private constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Get global RuntimeContext singleton.
   * Safe to call many times from anywhere in the server process.
   */
  static getInstance(projectRoot?: string): RuntimeContext {
    if (!this.instance) {
      this.instance = new RuntimeContext(projectRoot);
    }
    return this.instance;
  }

  /**
   * Convenience helper: get a database connection by key.
   * Ensures the runtime is initialized before accessing the pool.
   */
  static async getDbConnect(
    key: string = "primary"
  ): Promise<PostgresJsDatabase<Record<string, never>>> {
    const context = await this.getInstance();
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

  // ---------------------------------------------------------------------------
  // Public instance API
  // ---------------------------------------------------------------------------

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

  getConnectionPool(): ConnectionPool {
    return this._ensureState().connectionPool;
  }

  getModelInstance(): ModelInstance {
    return this._ensureState().modelInstance;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async _initialize(): Promise<void> {
    const isDev = process.env.NODE_ENV !== "production";
    const debugLog = (...args: any[]) => {
      if (isDev) {
        console.log("[RuntimeContext]", ...args);
      }
    };

    try {
      getLogModel();
      debugLog("Logging system initialized");

      debugLog("Creating connection pool...");
      const connectionPool = new ConnectionPool(this.projectRoot);
      debugLog("Connection pool created, initializing...");
      await connectionPool.initialize();
      debugLog("Connection pool initialized");

      debugLog("Creating model instance...");
      const modelInstance = await ModelInstance.create({
        projectRoot: this.projectRoot,
      });
      debugLog("Model instance created");

      debugLog("Loading configuration...");
      const configManager = ConfigManager.getInstance();
      await configManager.load();
      debugLog("Configuration loaded");

      this.state = {
        connectionPool,
        modelInstance,
        initializedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      };

      debugLog("Initialization completed", {
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
}
