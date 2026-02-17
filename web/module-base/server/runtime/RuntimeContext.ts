import type { RuntimeContextState } from "./types";

import dayjs from "dayjs";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { getLogModel } from "../models/Logs/LogModel";

import { ConfigManager } from "./ConfigManager";
import { ConnectionPool } from "./ConnectionPool";
import { Debug } from "./Debug";
import { ModelInstance } from "./ModelInstance";
import { RedisCache } from "./cache/RedisCache";
import { RedisClientManager } from "./cache/RedisClientManager";

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

  getRedisCache(): RedisCache | undefined {
    return this._ensureState().redisCache;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async _initialize(): Promise<void> {
    try {
      getLogModel();
      Debug.log("[RuntimeContext] Logging system initialized");

      Debug.log("[RuntimeContext] Creating connection pool...");
      const connectionPool = new ConnectionPool(this.projectRoot);

      Debug.log("[RuntimeContext] Connection pool created, initializing...");
      await connectionPool.initialize();
      Debug.log("[RuntimeContext] Connection pool initialized");

      Debug.log("[RuntimeContext] Creating model instance...");
      const modelInstance = await ModelInstance.create({
        projectRoot: this.projectRoot,
      });

      Debug.log("[RuntimeContext] Model instance created");

      Debug.log("[RuntimeContext] Loading configuration...");
      const configManager = ConfigManager.getInstance();

      await configManager.load();
      Debug.log("[RuntimeContext] Configuration loaded");

      // Initialize Redis if enabled
      let redisCache: RedisCache | undefined;
      const redisEnabled = process.env.REDIS_ENABLED === "true";

      if (redisEnabled) {
        Debug.log("[RuntimeContext] Initializing Redis...");
        try {
          const redisManager = new RedisClientManager();

          redisCache = new RedisCache(redisManager);
          Debug.log("[RuntimeContext] Redis initialized");
        } catch (error) {
          Debug.warn(
            "[RuntimeContext] Redis initialization failed, continuing without cache:",
            error
          );
        }
      } else {
        Debug.log("[RuntimeContext] Redis is disabled");
      }

      this.state = {
        connectionPool,
        modelInstance,
        redisCache,
        initializedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      };

      Debug.log("[RuntimeContext] Initialization completed", {
        hasState: !!this.state,
        hasConnectionPool: !!this.state?.connectionPool,
        hasModelInstance: !!this.state?.modelInstance,
      });
    } catch (error) {
      Debug.forceError("[RuntimeContext] Error during initialization:", error);
      Debug.forceError(
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
