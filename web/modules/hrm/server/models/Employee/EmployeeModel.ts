import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { BaseModel } from "@base/server/models/BaseModel";
import { base_tb_users } from "@base/server/schemas/base.user";

import { hrm_tb_employees } from "../../schemas";
import { hrm_tb_departments } from "../../schemas/hrm.department";
import { hrm_tb_positions } from "../../schemas/hrm.position";

const department = alias(hrm_tb_departments, "department");
const position = alias(hrm_tb_positions, "position");

export interface EmployeeRow {
  employeeId: string;
  userId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
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
    userId: this.table.id,
    firstName: this.table.firstName,
    lastName: this.table.lastName,
    nationalId: hrm_tb_employees.nationalId,
    taxId: hrm_tb_employees.taxId,
    emails: this.table.emails,
    phones: this.table.phones,
    dateOfBirth: this.table.dateOfBirth,
    gender: this.table.gender,
    address: this.table.address,
    position: {
      id: hrm_tb_positions.id,
      name: hrm_tb_positions.name,
    },
    department: {
      id: hrm_tb_departments.id,
      name: hrm_tb_departments.name,
    },
    manager: {
      id: hrm_tb_employees.managerId,
      firstName: base_tb_users.firstName,
      lastName: base_tb_users.lastName,
    },
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
      .leftJoin(department, eq(hrm_tb_employees.departmentId, department.id))
      .leftJoin(
        base_tb_users,
        eq(hrm_tb_employees.managerId, base_tb_users.id),
      );

  private mapRow(r: any): EmployeeRow {
    return {
      employeeId: r.employeeId,
      userId: r.userId,
      employeeCode: r.employeeCode,
      firstName: r.firstName,
      lastName: r.lastName,
      nationalId: r.nationalId,
      taxId: r.taxId,
      position: r.position,
      department: r.department,
      manager: r.manager,
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

  getDataByUserId = (params: { userId: string }) => {
    return this.getOne(eq(this.table.id, params.userId));
  };
}
