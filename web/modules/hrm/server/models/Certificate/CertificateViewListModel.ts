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

import { hrm_tb_certificates } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";

const employee = alias(hrm_tb_employees, "employee");

export interface CertificateRow {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  name?: unknown;
  issuer: string;
  certificateNumber?: string | null;
  issueDate: string;
  expiryDate?: string | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

class CertificateViewListModel extends BaseViewListModel<
  typeof hrm_tb_certificates,
  CertificateRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_certificates.id, sort: true }],
      ["employeeId", { column: hrm_tb_certificates.employeeId, sort: true }],
      ["name", { column: hrm_tb_certificates.name, sort: true }],
      ["issuer", { column: hrm_tb_certificates.issuer, sort: true }],
      ["issueDate", { column: hrm_tb_certificates.issueDate, sort: true }],
      ["expiryDate", { column: hrm_tb_certificates.expiryDate, sort: true }],
      ["isActive", { column: hrm_tb_certificates.isActive, sort: true }],
      ["createdAt", { column: hrm_tb_certificates.createdAt, sort: true }],
      ["updatedAt", { column: hrm_tb_certificates.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_certificates });
  }

  protected declarationSearch = () =>
    new Map([
      ["employeeCode", (text: string) => ilike(employee.employeeCode, text)],
      ["fullName", (text: string) => ilike(employee.fullName, text)],
      ["issuer", (text: string) => ilike(hrm_tb_certificates.issuer, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): CertificateRow => ({
    id: row.id,
    employeeId: row.employeeId,
    employee: row.employeeId
      ? {
          id: row.employeeId,
          employeeCode: row.employeeCode ?? undefined,
          fullName: row.employeeFullName ?? undefined,
        }
      : null,
    name: row.name,
    issuer: row.issuer,
    certificateNumber: row.certificateNumber ?? undefined,
    issueDate: row.issueDate,
    expiryDate: row.expiryDate ?? undefined,
    isActive: row.isActive ?? undefined,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<CertificateRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query.leftJoin(employee, eq(this.table.employeeId, employee.id))
    );
  };
}

export default CertificateViewListModel;

