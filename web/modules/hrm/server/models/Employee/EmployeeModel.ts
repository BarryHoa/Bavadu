import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { BaseModel } from "@base/server/models/BaseModel";
import { base_tb_users } from "@base/server/schemas/base.user";

import { JSON_RPC_ERROR_CODES, JsonRpcError } from "@/module-base/server/rpc";
import { hrm_tb_employees } from "../../schemas";
import { hrm_tb_departments } from "../../schemas/hrm.department";
import { hrm_tb_positions } from "../../schemas/hrm.position";

const department = alias(hrm_tb_departments, "department");
const position = alias(hrm_tb_positions, "position");

export interface EmployeeRow {
  employeeId: string;
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  emails: string[] | null;
  phones: string[] | null;
  nationalId: string | null;
  taxId: string | null;
  position: { id: string; name: string };
  department: { id: string; name: string };
  manager: { id: string; firstName: string; lastName: string };
  status: string;
  type: string;
  hireDate: string;
  probationEndDate: string;
  bankAccount: string;
  bankName: string;
  bankBranch: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

export default class EmployeeModel extends BaseModel<typeof base_tb_users> {
  constructor() {
    super(base_tb_users);
  }

  private selectShape = () => ({
    employeeId: hrm_tb_employees.id,
    code: hrm_tb_employees.code,
    id: this.table.id,
    firstName: this.table.firstName,
    lastName: this.table.lastName,
    nationalId: hrm_tb_employees.nationalId,
    taxId: hrm_tb_employees.taxId,
    emails: this.table.emails,
    phones: this.table.phones,
    dateOfBirth: this.table.dateOfBirth,
    gender: this.table.gender,
    address: this.table.address,
    positionId: hrm_tb_employees.positionId,
    positionName: position.name,
    departmentId: hrm_tb_employees.departmentId,
    departmentName: department.name,
    managerId: hrm_tb_employees.managerId,
    managerFirstName: base_tb_users.firstName,
    managerLastName: base_tb_users.lastName,
    type: hrm_tb_employees.type,
    hireDate: hrm_tb_employees.hireDate,
    probationEndDate: hrm_tb_employees.probationEndDate,
    bankAccount: hrm_tb_employees.bankAccount,
    bankName: hrm_tb_employees.bankName,
    bankBranch: hrm_tb_employees.bankBranch,
    emergencyContactName: hrm_tb_employees.emergencyContactName,
    emergencyContactPhone: hrm_tb_employees.emergencyContactPhone,
    createdAt: this.table.createdAt,
    updatedAt: this.table.updatedAt,
  });

  private baseQuery = () =>
    this.db
      .select(this.selectShape())
      .from(this.table)
      .leftJoin(hrm_tb_employees, eq(this.table.id, hrm_tb_employees.userId))
      .leftJoin(position, eq(hrm_tb_employees.positionId, position.id))
      .leftJoin(department, eq(hrm_tb_employees.departmentId, department.id));

  private mapRow(r: any): EmployeeRow {
    return {
      employeeId: r.employeeId,
      id: r.id,
      employeeCode: r.code,
      firstName: r.firstName,
      lastName: r.lastName,
      emails: r.emails,
      phones: r.phones,
      nationalId: r.nationalId,
      taxId: r.taxId,
      position: {
        id: r.positionId,
        name: r.positionName,
      },
      department: {
        id: r.departmentId,
        name: r.departmentName,
      },
      manager: {
        id: r.managerId,
        firstName: r.managerFirstName,
        lastName: r.managerLastName,
      },
      status: r.status,
      type: r.type,
      hireDate: r.hireDate,
      probationEndDate: r.probationEndDate,
      bankAccount: r.bankAccount,
      bankName: r.bankName,
      bankBranch: r.bankBranch,
      emergencyContactName: r.emergencyContactName,
      emergencyContactPhone: r.emergencyContactPhone,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  private getOne = async (where: ReturnType<typeof eq>) => {
    const [row] = await this.baseQuery().where(where).limit(1);

    return row ? this.mapRow(row) : null;
  };

  getDataByUserId = (params: { id?: string }) => {
    const userId = params.id;
    console.log("userId", userId);
    if (!userId) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.RESOURCE_NOT_FOUND,
        "Employee not found",
      );
    }
    return this.getOne(eq(this.table.id, userId));
  };
}
