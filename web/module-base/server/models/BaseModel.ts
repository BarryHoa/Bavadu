import type { Column } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { isEmpty } from "lodash";
import { getEnv } from "..";
import { ListParamsRequest } from "./interfaces/ListInterface";

export class BaseModel<TTable extends PgTable<any> = PgTable<any>> {
  /**Main table of the model */
  protected readonly table: TTable;
  constructor(table: TTable) {
    this.table = table;
  }

  /**Check if a field and value exists in the model */
  protected isExistInModelByFieldAndValue = async (params: {
    field: string;
    value: string;
    ignore?: Record<string, unknown>;
  }) => {
    const { field, value, ignore } = params;
    const db = getEnv().getDb();
    if (!db) {
      throw new Error("Database not initialized");
    }
    // check if field exists in table schema
    const column = this.table[field as keyof typeof this.table] as unknown as
      | Column<any>
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
            | Column<any>
            | undefined
        )
      );
      if (ignoredColumnsInTable.length !== ignoredColumns.length) {
        throw new Error(`Ignored columns not found in table definition.`);
      }
    }

    const whereClause = !isEmpty(ignore)
      ? and(
          eq(column as Column<any>, value),
          ...Object.entries(ignore).map(([key, value]) => {
            const ignoreColumn = this.table[
              key as keyof typeof this.table
            ] as unknown as Column<any> | undefined;
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

  /**Get default parameters for list */
  getDefaultParamsForList = (params?: ListParamsRequest) => {
    const { offset, limit, search, filters, sorts } = params || {};
    return {
      offset: offset || 0,
      limit: limit || 10,
      search: search || undefined,
      filters: filters || undefined,
      sorts: sorts || undefined,
    };
  };

  /**Get pagination data */
  getPagination(options: { data?: any; total?: number }) {
    const { data, total = 0 } = options;

    return {
      data,
      total,
    };
  }
}
