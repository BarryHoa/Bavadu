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

import { table_department } from "../../schemas";

export interface DepartmentDropdownRow {
  id: string;
  code: string;
  name?: unknown;
  isActive?: boolean;
}

class DepartmentDropdownListModel extends BaseViewListModel<
  typeof table_department,
  DepartmentDropdownRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: table_department.id, sort: true }],
      ["code", { column: table_department.code, sort: true }],
      ["name", { column: table_department.name, sort: true }],
      ["isActive", { column: table_department.isActive, sort: true }],
    ]);

  constructor() {
    super({ table: table_department });
  }

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(table_department.code, text)],
      ["name", (text: string) => ilike(table_department.name, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): DepartmentDropdownRow => ({
    id: row.id,
    code: row.code,
    name: row.name,
    isActive: row.isActive ?? undefined,
  });

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<DepartmentDropdownRow>> => {
    return this.buildQueryDataList(params);
  };
}

export default DepartmentDropdownListModel;

