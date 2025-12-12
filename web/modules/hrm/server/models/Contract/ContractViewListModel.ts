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

import { table_contract } from "../../schemas";
import { table_employee } from "../../schemas/employee";

const employee = alias(table_employee, "employee");

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
  typeof table_contract,
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
      ["id", { column: table_contract.id, sort: true }],
      ["contractNumber", { column: table_contract.contractNumber, sort: true }],
      ["employeeId", { column: table_contract.employeeId, sort: true }],
      ["contractType", { column: table_contract.contractType, sort: true }],
      ["startDate", { column: table_contract.startDate, sort: true }],
      ["endDate", { column: table_contract.endDate, sort: true }],
      ["baseSalary", { column: table_contract.baseSalary, sort: true }],
      ["status", { column: table_contract.status, sort: true }],
      ["isActive", { column: table_contract.isActive, sort: true }],
      ["createdAt", { column: table_contract.createdAt, sort: true }],
      ["updatedAt", { column: table_contract.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: table_contract });
  }

  protected declarationSearch = () =>
    new Map([
      [
        "contractNumber",
        (text: string) => ilike(table_contract.contractNumber, text),
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    params: ListParamsRequest
  ): Promise<ListParamsResponse<ContractRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query.leftJoin(employee, eq(this.table.employeeId, employee.id))
    );
  };
}

export default ContractViewListModel;

