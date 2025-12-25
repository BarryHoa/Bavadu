import type { Column } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { and, eq } from "drizzle-orm";
import { isEmpty } from "lodash";

import { RuntimeContext } from "../runtime/RuntimeContext";

export class BaseModel<TTable extends PgTable = PgTable> {
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
}
