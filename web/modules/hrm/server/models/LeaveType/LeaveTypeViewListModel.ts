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

import { hrm_tb_leave_types } from "../../schemas";

export interface LeaveTypeRow {
  id: string;
  code: string;
  name?: unknown;
  accrualType: string;
  accrualRate?: number | null;
  maxAccrual?: number | null;
  carryForward?: boolean;
  requiresApproval?: boolean;
  isPaid?: boolean;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

class LeaveTypeViewListModel extends BaseViewListModel<
  typeof hrm_tb_leave_types,
  LeaveTypeRow
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
      ["accrualType", { column: hrm_tb_leave_types.accrualType, sort: true }],
      ["accrualRate", { column: hrm_tb_leave_types.accrualRate, sort: true }],
      ["isActive", { column: hrm_tb_leave_types.isActive, sort: true }],
      ["createdAt", { column: hrm_tb_leave_types.createdAt, sort: true }],
      ["updatedAt", { column: hrm_tb_leave_types.updatedAt, sort: true }],
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): LeaveTypeRow => ({
    id: row.id,
    code: row.code,
    name: row.name,
    accrualType: row.accrualType,
    accrualRate: row.accrualRate ?? undefined,
    maxAccrual: row.maxAccrual ?? undefined,
    carryForward: row.carryForward ?? undefined,
    requiresApproval: row.requiresApproval ?? undefined,
    isPaid: row.isPaid ?? undefined,
    isActive: row.isActive ?? undefined,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<LeaveTypeRow>> => {
    return this.buildQueryDataList(params);
  };
}

export default LeaveTypeViewListModel;

