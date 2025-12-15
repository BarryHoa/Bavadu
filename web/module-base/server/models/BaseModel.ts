import type { Column } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { isEmpty } from "lodash";
import { RuntimeContext } from "../runtime/RuntimeContext";

export class BaseModel<TTable extends PgTable = PgTable> {
  /**Main table of the model */
  protected readonly table: TTable;
  private _db: PostgresJsDatabase<Record<string, never>> | null = null;
  private _dbPromise: Promise<
    PostgresJsDatabase<Record<string, never>>
  > | null = null;

  constructor(table: TTable) {
    this.table = table;
  }

  /**
   * Get database connection (lazy initialization)
   * Thread-safe: ensures runtime is initialized before returning connection
   */
  protected async getDb(): Promise<PostgresJsDatabase<Record<string, never>>> {
    // If already initialized, return immediately
    if (this._db) {
      return this._db;
    }

    // If initialization is in progress, wait for it
    if (this._dbPromise) {
      return this._dbPromise;
    }

    // Start initialization
    this._dbPromise = RuntimeContext.getDbConnect().then((db) => {
      this._db = db;
      return db;
    });

    return this._dbPromise;
  }

  /**
   * Synchronous getter for backward compatibility
   * @deprecated Use getDb() instead. This will throw if db is not initialized.
   */
  protected get db(): PostgresJsDatabase<Record<string, never>> {
    if (!this._db) {
      throw new Error(
        "Database not initialized. Use await getDb() or ensure runtime is initialized first."
      );
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
    const db = await this.getDb();
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
            | undefined
        )
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
                `Ignored column ${key} not found in table definition.`
              );
            }
            return eq(ignoreColumn, value);
          })
        )
      : eq(column, value);

    const result = await db
      .select()
      .from(this.table as any)
      .where(whereClause)
      .limit(1);

    return result?.length > 0
      ? { isExist: true, data: result[0] }
      : { isExist: false, data: null };
  };
}
