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

import { hrm_tb_leave_types } from "../../schemas";

export interface LeaveTypeDropdownRow {
  id: string;
  code: string;
  name?: unknown;
  isActive?: boolean;
}

class LeaveTypeDropdownListModel extends BaseViewListModel<
  typeof hrm_tb_leave_types,
  LeaveTypeDropdownRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_leave_types.id, sort: true }],
      ["code", { column: hrm_tb_leave_types.code, sort: true }],
      ["name", { column: hrm_tb_leave_types.name, sort: true }],
      ["isActive", { column: hrm_tb_leave_types.isActive, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_leave_types });
  }

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(hrm_tb_leave_types.code, text)],
      ["name", (text: string) => ilike(hrm_tb_leave_types.name, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): LeaveTypeDropdownRow => ({
    id: row.id,
    code: row.code,
    name: row.name,
    isActive: row.isActive ?? undefined,
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<LeaveTypeDropdownRow>> => {
    return this.buildQueryDataList(params);
  };
}

export default LeaveTypeDropdownListModel;
