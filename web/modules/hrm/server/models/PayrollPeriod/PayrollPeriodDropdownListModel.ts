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

import { hrm_tb_payrolls_period } from "../../schemas";

export interface PayrollPeriodDropdownRow {
  id: string;
  code?: string | null;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isLocked?: boolean;
}

class PayrollPeriodDropdownListModel extends BaseViewListModel<
  typeof hrm_tb_payrolls_period,
  PayrollPeriodDropdownRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_payrolls_period.id, sort: true }],
      ["code", { column: hrm_tb_payrolls_period.code, sort: true }],
      ["name", { column: hrm_tb_payrolls_period.name, sort: true }],
      ["isLocked", { column: hrm_tb_payrolls_period.isLocked, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_payrolls_period });
  }

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(hrm_tb_payrolls_period.code, text)],
      ["name", (text: string) => ilike(hrm_tb_payrolls_period.name, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): PayrollPeriodDropdownRow => ({
    id: row.id,
    code: row.code ?? undefined,
    name: row.name ?? undefined,
    startDate: row.startDate ?? undefined,
    endDate: row.endDate ?? undefined,
    isLocked: row.isLocked ?? undefined,
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<PayrollPeriodDropdownRow>> => {
    return this.buildQueryDataList(params);
  };
}

export default PayrollPeriodDropdownListModel;
