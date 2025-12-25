import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { ParamFilter } from "@base/shared/interface/FilterInterface";
import type { Column } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import { ilike } from "drizzle-orm";

import { hrm_tb_departments } from "../../schemas";

export interface DepartmentDropdownRow {
  id: string;
  code: string;
  name?: unknown;
  isActive?: boolean;
}

class DepartmentDropdownListModel extends BaseViewListModel<
  typeof hrm_tb_departments,
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
      ["id", { column: hrm_tb_departments.id, sort: true }],
      ["code", { column: hrm_tb_departments.code, sort: true }],
      ["name", { column: hrm_tb_departments.name, sort: true }],
      ["isActive", { column: hrm_tb_departments.isActive, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_departments });
  }

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(hrm_tb_departments.code, text)],
      ["name", (text: string) => ilike(hrm_tb_departments.name, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): DepartmentDropdownRow => ({
    id: row.id,
    code: row.code,
    name: row.name,
    isActive: row.isActive ?? undefined,
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<DepartmentDropdownRow>> => {
    return this.buildQueryDataList(params);
  };
}

export default DepartmentDropdownListModel;
