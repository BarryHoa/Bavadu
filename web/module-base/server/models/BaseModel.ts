import type { Column } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { and, eq } from "drizzle-orm";
import { isEmpty } from "lodash";

import { RuntimeContext } from "../runtime/RuntimeContext";

/**
 * Rule for RPC method: require auth and/or permissions.
 * Permission format: module.feature.action (vd: hrm.employee.view).
 * Backend hỗ trợ wildcard: hrm.employee.* (mọi quyền feature), hrm.* (mọi quyền module).
 */
export type AuthRule = {
  required: boolean;
  permissions?: string[];
};

const AUTH_RULE_KEY = Symbol("BaseModel.authRule");

/** Descriptor có thể có initializer (class field) theo TS experimentalDecorators */
type DescriptorWithInitializer = PropertyDescriptor & {
  initializer?: () => unknown;
};

export class BaseModel<TTable extends PgTable = PgTable> {
  /**
   * Decorator: gắn auth rule trực tiếp lên method hoặc arrow field.
   * Hỗ trợ cả method (descriptor.value) và class field arrow (descriptor.initializer).
   * @BaseModel.Auth({ required: true, permissions: ["..."] })
   */
  static Auth(rule: AuthRule) {
    return function (
      _target: object,
      _propertyKey: string,
      descriptor?: DescriptorWithInitializer,
    ): any {
      if (!descriptor) return descriptor;
      if (typeof descriptor.value === "function") {
        (descriptor.value as unknown as { [AUTH_RULE_KEY]: AuthRule })[
          AUTH_RULE_KEY
        ] = rule;
        return descriptor;
      }
      if (typeof descriptor.initializer === "function") {
        const originalInitializer = descriptor.initializer;
        descriptor.initializer = function (this: unknown) {
          const fn = originalInitializer.call(this);
          if (typeof fn === "function") {
            (fn as unknown as { [AUTH_RULE_KEY]: AuthRule })[AUTH_RULE_KEY] =
              rule;
          }
          return fn;
        };
      }
      return descriptor;
    };
  }

  /**Main table of the model */
  protected readonly table: TTable;
  private _db: PostgresJsDatabase<Record<string, never>> | null = null;

  constructor(table: TTable) {
    this.table = table;
  }

  public get db(): PostgresJsDatabase<Record<string, never>> {
    if (!this._db) {
      // Try to grab a ready connection synchronously if RuntimeContext is already initialized.
      // This avoids a race where the constructor kicks off async init but methods access `db`
      // immediately (same tick) before the Promise resolves.
      try {
        const ctx = RuntimeContext.getInstance();
        const db = ctx.getConnectionPool().getConnection();

        this._db = db;

        return db;
      } catch {
        console.log("Error getting database connection:");
        // Best-effort warm-up in background (do not block a sync getter)
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

  /**Check if a field and value exists in the model */
  protected isExistInModelByFieldAndValue = async (params: {
    field: string;
    value: string;
    ignore?: Record<string, unknown>;
  }) => {
    const { field, value, ignore } = params;

    // check if field exists in table schema
    const column = this.table[field as keyof typeof this.table] as
      | Column
      | undefined;

    if (!column) {
      throw new Error(`Field ${field} not found in table definition.`);
    }
    // if ignore is provided, ignore the row with this id when checking for duplicates, otherwise check for duplicates
    if (!isEmpty(ignore)) {
      // check  ignored has in table schema
      const ignoredColumns = Object.keys(ignore || {});
      const ignoredColumnsInTable = ignoredColumns.filter((columnName) =>
        Boolean(
          this.table[columnName as keyof typeof this.table] as
            | Column
            | undefined,
        ),
      );

      if (ignoredColumnsInTable.length !== ignoredColumns.length) {
        throw new Error(`Ignored columns not found in table definition.`);
      }
    }

    const whereClause = !isEmpty(ignore)
      ? and(
          eq(column, value),
          ...Object.entries(ignore).map(([key, value]) => {
            const ignoreColumn = this.table[key as keyof typeof this.table] as
              | Column
              | undefined;

            if (!ignoreColumn) {
              throw new Error(
                `Ignored column ${key} not found in table definition.`,
              );
            }

            return eq(ignoreColumn, value);
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

  /**
   * Get auth rule for an RPC method. Đọc trực tiếp từ metadata trên method (do @BaseModel.Auth gắn).
   */
  getAuthRuleForMethod(methodName: string): AuthRule | null {
    const fn = (this as any)[methodName];
    if (typeof fn !== "function") return null;
    const rule = (fn as unknown as { [AUTH_RULE_KEY]?: AuthRule })[AUTH_RULE_KEY];
    return rule ?? null;
  }
}
