import type { RuntimeContextState } from "./types";

import dayjs from "dayjs";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { getLogModel } from "../models/Logs/LogModel";

import { ConfigManager } from "./ConfigManager";
import { ConnectionPool } from "./ConnectionPool";
import { ModelInstance } from "./ModelInstance";

/**
 * Runtime Context Manager
 * - Singleton with promise lock to guard initialization
 * - Provides shared connection pool + model registry
 */
export class RuntimeContext {
  // ---------------------------------------------------------------------------
  // Static singleton + convenience helpers
  // ---------------------------------------------------------------------------
  /**
   * NOTE:
   * In Next.js (especially dev/Turbopack) the same source file can be loaded
   * multiple times from different module graphs (e.g. TS source via `tsx/bun`
   * for `server.ts` and compiled output under `.next/` for route handlers).
   *
   * If we keep the singleton only as a static field, we'll accidentally create
   * multiple "singletons" and lose initialization state across graphs.
   *
   * Storing the singleton on `globalThis` makes it truly process-wide.
   */
  private static readonly LEGACY_GLOBAL_KEY = "__BAVADU_RUNTIME_CONTEXT__";
  private static readonly GLOBAL_SYMBOL = Symbol.for("bavadu.RuntimeContext");
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
    const g = globalThis as unknown as Record<PropertyKey, unknown>;
    const existingSymbol = g[this.GLOBAL_SYMBOL] as RuntimeContext | undefined;

    if (existingSymbol) {
      return existingSymbol;
    }

    // Backward compatibility: reuse instance stored under legacy string key
    const existingLegacy = g[this.LEGACY_GLOBAL_KEY] as
      | RuntimeContext
      | undefined;

    if (existingLegacy) {
      Object.defineProperty(g, this.GLOBAL_SYMBOL, {
        value: existingLegacy,
        writable: false,
        enumerable: false,
        configurable: false,
      });

      return existingLegacy;
    }

    const created = new RuntimeContext(projectRoot);

    // Define as non-writable/non-configurable to prevent accidental overwrite
    Object.defineProperty(g, this.GLOBAL_SYMBOL, {
      value: created,
      writable: false,
      enumerable: false,
      configurable: false,
    });
    Object.defineProperty(g, this.LEGACY_GLOBAL_KEY, {
      value: created,
      writable: false,
      enumerable: false,
      configurable: false,
    });

    return created;
  }

  /**
   * Convenience helper: get a database connection by key.
   * Ensures the runtime is initialized before accessing the pool.
   */
  static async getDbConnect(
    key: string = "primary",
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
    modelId: string,
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
        // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.error("[RuntimeContext] Error during initialization:", error);
      // eslint-disable-next-line no-console
      console.error(
        "[RuntimeContext] Error stack:",
        error instanceof Error ? error.stack : "No stack",
      );
      throw error;
    }
  }

  private _ensureState(): RuntimeContextState {
    if (!this.isInitialized || !this.state) {
      throw new Error(
        "Runtime not initialized. Call ensureInitialized() first.",
      );
    }

    return this.state;
  }
}
