import type { Column } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { CacheOptions, CacheResult, RedisCache } from "../runtime/cache";

import { and, eq } from "drizzle-orm";
import { isEmpty } from "lodash";

import { CACHE_NOT_FOUND } from "../runtime/cache";
import { RuntimeContext } from "../runtime/RuntimeContext";

// ============================================================================
// Permission decorator types & helpers
// ============================================================================

export type PermissionRequiredOptions = {
  /** Whether authentication is required to call the method. */
  auth: boolean;
  /** Optional list of permission keys required to call the method. */
  permissions?: string[];
};

const PERMISSION_RULE_KEY = Symbol("BaseModel.permissionRule");

/**
 * Descriptor that may include an `initializer` (for class fields / arrow functions)
 * used by legacy / experimental decorators.
 */
type DescriptorWithInitializer = PropertyDescriptor & {
  initializer?: () => unknown;
};

/**
 * Low‑level decorator factory that attaches a permission rule
 * to a method or a field initializer.
 */
function applyPermissionRequiredDecorator(rule: PermissionRequiredOptions) {
  return function (
    _target: object,
    _propertyKey: string,
    descriptor?: DescriptorWithInitializer,
  ): any {
    if (!descriptor) return descriptor;

    // Classic method decorator
    if (typeof descriptor.value === "function") {
      (
        descriptor.value as unknown as {
          [PERMISSION_RULE_KEY]: PermissionRequiredOptions;
        }
      )[PERMISSION_RULE_KEY] = rule;

      return descriptor;
    }

    // Field initializer decorator (arrow function properties)
    if (typeof descriptor.initializer === "function") {
      const originalInitializer = descriptor.initializer;

      descriptor.initializer = function (this: unknown) {
        const fn = originalInitializer.call(this);

        if (typeof fn === "function") {
          (
            fn as unknown as {
              [PERMISSION_RULE_KEY]: PermissionRequiredOptions;
            }
          )[PERMISSION_RULE_KEY] = rule;
        }

        return fn;
      };
    }

    return descriptor;
  };
}

/**
 * Public decorator to attach permission metadata to a method or arrow function field.
 *
+ * Usage:
 * - `@PermissionRequired({ auth: true })`
 * - `@PermissionRequired({ auth: true, permissions: ["hrm.employee.view"] })`
 */
export function PermissionRequired(rule: PermissionRequiredOptions) {
  return applyPermissionRequiredDecorator(rule);
}

// ============================================================================
// BaseModel
// ============================================================================

export class BaseModel<TTable extends PgTable = PgTable> {
  // --------------------------------------------------------------------------
  // Static helpers
  // --------------------------------------------------------------------------

  /**
   * Class‑scoped alias for the `@PermissionRequired` decorator,
   * so callers can use `BaseModel.PermissionRequired(...)` if they prefer.
   */
  static PermissionRequired(rule: PermissionRequiredOptions) {
    return applyPermissionRequiredDecorator(rule);
  }

  // --------------------------------------------------------------------------
  // Core state
  // --------------------------------------------------------------------------

  /** Primary drizzle table associated with this model. */
  protected readonly table: TTable;

  /** Lazily‑initialized database connection. */
  private _db: PostgresJsDatabase<Record<string, never>> | null = null;

  /**
   * Optional cache prefix for models that opt‑in to Redis‑based caching.
   *
   * If a subclass does not assign a value to `cachePrefix`, all cache helpers
   * effectively become no‑ops and the model behaves as "non‑cached".
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected cachePrefix?: string;

  constructor(table: TTable) {
    this.table = table;
  }

  // --------------------------------------------------------------------------
  // Database access
  // --------------------------------------------------------------------------

  /**
   * Lazily returns a database connection from the shared `RuntimeContext`.
   *
   * The getter tries to synchronously obtain a connection. If the underlying
   * async initialization is still in flight, it will trigger a best‑effort
   * warm‑up in the background and throw an error for the current call.
   */
  protected get db(): PostgresJsDatabase<Record<string, never>> {
    if (!this._db) {
      try {
        const ctx = RuntimeContext.getInstance();
        const db = ctx.getConnectionPool().getConnection();

        this._db = db;

        return db;
      } catch {
        // Log once for observability and then rethrow a generic error.
        // eslint-disable-next-line no-console
        console.log("Error getting database connection:");

        // Fire‑and‑forget warm‑up so the next call has a higher chance to succeed.
        void RuntimeContext.getDbConnect()
          .then((db) => {
            this._db = db;
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error("Error getting database connection:", error);
          });

        throw new Error("Database connection not initialized");
      }
    }

    return this._db;
  }

  // --------------------------------------------------------------------------
  // Optional cache helpers
  // --------------------------------------------------------------------------

  /**
   * Returns the shared Redis cache client from `RuntimeContext` if available.
   * Swallows initialization errors and returns `undefined` when cache is disabled.
   */
  private _getCache(): RedisCache | undefined {
    try {
      return RuntimeContext.getInstance().getRedisCache();
    } catch {
      return undefined;
    }
  }

  /**
   * Check whether Redis cache is available and currently connected.
   *
   * This wraps `_getCache()` so subclasses do not need to depend on
   * cache client internals or handle connection errors.
   */
  protected isCacheConnected(): boolean {
    const cache = this._getCache();
    return cache?.getStatus?.()?.connected ?? false;
  }

  /**
   * Convenience helper to check whether a cache read result indicates
   * a "not found / cache missed" sentinel value.
   */
  // eslint-disable-next-line class-methods-use-this
  protected isCachedNotFound<T = unknown>(result: CacheResult<T>): boolean {
    return result === CACHE_NOT_FOUND;
  }

  /**
   * Hook for subclasses to customize how cache keys are transformed.
   * By default it returns the key as‑is.
   */
  // eslint-disable-next-line class-methods-use-this
  protected getCacheKey(key: string): string {
    return key;
  }

  /**
   * Read a value from cache using the provided logical key.
   *
   * Returns `CACHE_NOT_FOUND` when:
   * - Redis is disabled or not connected, or
   * - The key does not exist in Redis, or
   * - The model did not opt‑in to caching (`cachePrefix` is undefined).
   */
  protected async cacheGet<T = unknown>(key: string): Promise<CacheResult<T>> {
    const cache = this._getCache();

    if (!cache || !this.cachePrefix) {
      return CACHE_NOT_FOUND;
    }

    const finalKey = this.getCacheKey(key);

    return cache.get<T>(finalKey, { prefix: this.cachePrefix });
  }

  /**
   * Store a value in cache under the provided logical key.
   *
   * Returns `false` when Redis is not available or the model did not opt‑in
   * to caching (`cachePrefix` is undefined).
   */
  protected async cacheSet<T = unknown>(
    value: T,
    key: string,
    options?: CacheOptions,
  ): Promise<boolean> {
    const cache = this._getCache();

    if (!cache || !this.cachePrefix) {
      return false;
    }

    const finalKey = this.getCacheKey(key);

    return cache.set<T>(finalKey, value, {
      prefix: this.cachePrefix,
      ...options,
    });
  }

  /**
   * Delete a single cached entry associated with the provided logical key.
   *
   * Returns `false` when Redis is not available or the model did not opt‑in
   * to caching.
   */
  protected async cacheDelete(key: string): Promise<boolean> {
    const cache = this._getCache();

    if (!cache || !this.cachePrefix) {
      return false;
    }

    const finalKey = this.getCacheKey(key);

    return cache.delete(finalKey, { prefix: this.cachePrefix });
  }

  /**
   * Delete multiple cached entries at once.
   *
   * Returns `0` when Redis is not available, the model did not opt‑in
   * to caching, or the provided key list is empty.
   */
  protected async cacheDeleteMany(keys: string[]): Promise<number> {
    const cache = this._getCache();

    if (!cache || !this.cachePrefix || keys.length === 0) {
      return 0;
    }

    const finalKeys = keys.map((key) => this.getCacheKey(key));

    return cache.deleteMany(finalKeys, { prefix: this.cachePrefix });
  }

  // --------------------------------------------------------------------------
  // Common validation helpers
  // --------------------------------------------------------------------------

  /**
   * Check whether a value already exists for a given column in the main table.
   *
   * Optionally accepts an `ignore` object (e.g. `{ id: currentId }`) to exclude
   * specific rows from the uniqueness check.
   *
   * Throws when:
   * - The target column does not exist in the table schema, or
   * - Any `ignore` key does not exist in the table schema.
   */
  protected isExistInModelByFieldAndValue = async (params: {
    field: string;
    value: string;
    ignore?: Record<string, unknown>;
  }) => {
    const { field, value, ignore } = params;

    const column = this.table[field as keyof typeof this.table] as
      | Column
      | undefined;

    if (!column) {
      throw new Error(`Field ${field} not found in table definition.`);
    }

    if (!isEmpty(ignore)) {
      const ignoredColumns = Object.keys(ignore || {});
      const ignoredColumnsInTable = ignoredColumns.filter((columnName) =>
        Boolean(
          this.table[columnName as keyof typeof this.table] as
            | Column
            | undefined,
        ),
      );

      if (ignoredColumnsInTable.length !== ignoredColumns.length) {
        throw new Error("Ignored columns not found in table definition.");
      }
    }

    const whereClause = !isEmpty(ignore)
      ? and(
          eq(column, value),
          ...Object.entries(ignore).map(([key, ignoreValue]) => {
            const ignoreColumn = this.table[key as keyof typeof this.table] as
              | Column
              | undefined;

            if (!ignoreColumn) {
              throw new Error(
                `Ignored column ${key} not found in table definition.`,
              );
            }

            return eq(ignoreColumn, ignoreValue);
          }),
        )
      : eq(column, value);

    const result = await this.db
      ?.select()
      .from(this.table as any)
      .where(whereClause)
      .limit(1);

    return result?.length && result.length > 0
      ? { isExist: true, data: result[0] }
      : { isExist: false, data: null };
  };

  // --------------------------------------------------------------------------
  // Permission metadata helpers
  // --------------------------------------------------------------------------

  /**
   * Read the permission rule attached to a public RPC method on this model.
   *
   * The rule is stored directly on the function value by the `@PermissionRequired`
   * decorator (or `BaseModel.PermissionRequired`).
   */
  getPermissionRequiredForMethod(
    methodName: string,
  ): PermissionRequiredOptions | null {
    const fn = (this as any)[methodName];

    if (typeof fn !== "function") return null;

    const rule = (
      fn as unknown as { [PERMISSION_RULE_KEY]?: PermissionRequiredOptions }
    )[PERMISSION_RULE_KEY];

    return rule ?? null;
  }
}
