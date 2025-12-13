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
import { ilike } from "drizzle-orm";

import { hrm_tb_payrolls_period } from "../../schemas";

export interface PayrollPeriodDropdownRow {
  id: string;
  code?: string | null;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
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
      ["isActive", { column: hrm_tb_payrolls_period.isActive, sort: true }],
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): PayrollPeriodDropdownRow => ({
    id: row.id,
    code: row.code ?? undefined,
    name: row.name ?? undefined,
    startDate: row.startDate ?? undefined,
    endDate: row.endDate ?? undefined,
    isActive: row.isActive ?? undefined,
  });

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<PayrollPeriodDropdownRow>> => {
    return this.buildQueryDataList(params);
  };
}

export default PayrollPeriodDropdownListModel;

