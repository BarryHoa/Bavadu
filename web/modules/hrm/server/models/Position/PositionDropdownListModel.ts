import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { ParamFilter } from "@base/server/models/interfaces/FilterInterface";
import type { Column } from "drizzle-orm";
import { eq, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { table_position } from "../../schemas";
import { table_department } from "../../schemas/department";

const department = alias(table_department, "department");

export interface PositionDropdownRow {
  id: string;
  code: string;
  name?: unknown;
  departmentId: string;
  department?: {
    id: string;
    name?: unknown;
  } | null;
  isActive?: boolean;
}

class PositionDropdownListModel extends BaseViewListModel<
  typeof table_position,
  PositionDropdownRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: table_position.id, sort: true }],
      ["code", { column: table_position.code, sort: true }],
      ["name", { column: table_position.name, sort: true }],
      ["departmentId", { column: table_position.departmentId, sort: true }],
      ["isActive", { column: table_position.isActive, sort: true }],
    ]);

  constructor() {
    super({ table: table_position });
  }

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(table_position.code, text)],
      ["name", (text: string) => ilike(table_position.name, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): PositionDropdownRow => ({
    id: row.id,
    code: row.code,
    name: row.name,
    departmentId: row.departmentId,
    department: row.departmentId
      ? {
          id: row.departmentId,
          name: row.departmentName ?? undefined,
        }
      : null,
    isActive: row.isActive ?? undefined,
  });

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<PositionDropdownRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query.leftJoin(department, eq(this.table.departmentId, department.id))
    );
  };
}

export default PositionDropdownListModel;

