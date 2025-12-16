import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { ParamFilter } from "@base/server/models/interfaces/FilterInterface";
import type { Column } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import { ilike } from "drizzle-orm";

import { hrm_tb_shifts } from "../../schemas";

export interface ShiftDropdownRow {
  id: string;
  code?: string | null;
  name?: unknown;
  isActive?: boolean;
}

class ShiftDropdownListModel extends BaseViewListModel<
  typeof hrm_tb_shifts,
  ShiftDropdownRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_shifts.id, sort: true }],
      ["code", { column: hrm_tb_shifts.code, sort: true }],
      ["name", { column: hrm_tb_shifts.name, sort: true }],
      ["isActive", { column: hrm_tb_shifts.isActive, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_shifts });
  }

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(hrm_tb_shifts.code, text)],
      ["name", (text: string) => ilike(hrm_tb_shifts.name, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): ShiftDropdownRow => ({
    id: row.id,
    code: row.code ?? undefined,
    name: row.name,
    isActive: row.isActive ?? undefined,
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<ShiftDropdownRow>> => {
    return this.buildQueryDataList(params);
  };
}

export default ShiftDropdownListModel;
