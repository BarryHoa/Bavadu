import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { ParamFilter } from "@base/shared/interface/FilterInterface";
import type { Column } from "drizzle-orm";

import { eq, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";

import { hrm_tb_contracts } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";

const employee = alias(hrm_tb_employees, "employee");

export interface ContractRow {
  id: string;
  contractNumber: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  contractType: string;
  startDate: string;
  endDate?: string | null;
  baseSalary: number;
  status: string;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

class ContractViewListModel extends BaseViewListModel<
  typeof hrm_tb_contracts,
  ContractRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_contracts.id, sort: true }],
      [
        "contractNumber",
        { column: hrm_tb_contracts.contractNumber, sort: true },
      ],
      ["employeeId", { column: hrm_tb_contracts.employeeId, sort: true }],
      ["contractType", { column: hrm_tb_contracts.contractType, sort: true }],
      ["startDate", { column: hrm_tb_contracts.startDate, sort: true }],
      ["endDate", { column: hrm_tb_contracts.endDate, sort: true }],
      ["baseSalary", { column: hrm_tb_contracts.baseSalary, sort: true }],
      ["status", { column: hrm_tb_contracts.status, sort: true }],
      ["isActive", { column: hrm_tb_contracts.isActive, sort: true }],
      ["createdAt", { column: hrm_tb_contracts.createdAt, sort: true }],
      ["updatedAt", { column: hrm_tb_contracts.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_contracts });
  }

  protected declarationSearch = () =>
    new Map([
      [
        "contractNumber",
        (text: string) => ilike(hrm_tb_contracts.contractNumber, text),
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): ContractRow => ({
    id: row.id,
    contractNumber: row.contractNumber,
    employeeId: row.employeeId,
    employee: row.employeeId
      ? {
          id: row.employeeId,
          employeeCode: row.employeeCode ?? undefined,
          fullName: row.employeeFullName ?? undefined,
        }
      : null,
    contractType: row.contractType,
    startDate: row.startDate,
    endDate: row.endDate ?? undefined,
    baseSalary: row.baseSalary,
    status: row.status,
    isActive: row.isActive ?? undefined,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<ContractRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query.leftJoin(employee, eq(this.table.employeeId, employee.id)),
    );
  };
}

export default ContractViewListModel;
