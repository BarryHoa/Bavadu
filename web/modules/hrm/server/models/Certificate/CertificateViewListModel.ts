import type { ParamFilter } from "@base/shared/interface/FilterInterface";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { Column } from "drizzle-orm";

import { eq, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { PermissionRequired } from "@base/server/models/BaseModel";
import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import { base_tb_users } from "@base/server/schemas/base.user";

import { hrm_tb_certificates } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";
import { fullNameSqlFrom } from "../Employee/employee.helpers";

const employee = alias(hrm_tb_employees, "employee");
const user = alias(base_tb_users, "user");

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
      ["employeeCode", (text: string) => ilike(employee.code, text)],
      ["fullName", (text: string) => ilike(fullNameSqlFrom(user), text)],
      ["issuer", (text: string) => ilike(hrm_tb_certificates.issuer, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

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

  @PermissionRequired({ auth: true, permissions: ["hrm.certificate.view"] })
  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<CertificateRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query
        .leftJoin(employee, eq(this.table.employeeId, employee.id))
        .leftJoin(user, eq(employee.userId, user.id)),
    );
  };
}

export default CertificateViewListModel;
