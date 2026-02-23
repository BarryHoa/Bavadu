import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { BaseModel } from "@base/server/models/BaseModel";

import {
  base_tb_users,
  base_tb_users_login,
} from "@base/server/schemas/base.user";

import {
  buildFullName,
  normalizePayload,
  type EmployeeInput,
} from "./employee.helpers";

import { NewHrmTbEmployee, hrm_tb_employees } from "../../schemas";
import { hrm_tb_departments } from "../../schemas/hrm.department";
import { hrm_tb_positions } from "../../schemas/hrm.position";

export type { EmployeeInput };

const department = alias(hrm_tb_departments, "department");
const position = alias(hrm_tb_positions, "position");
const manager = alias(hrm_tb_employees, "manager");
const user = alias(base_tb_users, "user");
const userLogin = alias(base_tb_users_login, "userLogin");
const managerUser = alias(base_tb_users, "managerUser");

export interface EmployeeRow {
  id: string;
  userId?: string | null;
  employeeCode: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationalId?: string | null;
  taxId?: string | null;
  address?: unknown;
  positionId: string;
  position?: { id: string; name?: unknown } | null;
  departmentId: string;
  department?: { id: string; name?: unknown } | null;
  managerId?: string | null;
  manager?: { id: string; employeeCode?: string; fullName?: string | null } | null;
  employmentStatus: string;
  employmentType?: string | null;
  hireDate: string;
  probationEndDate?: string | null;
  baseSalary?: number | null;
  currency?: string | null;
  locationId?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

type DbRow = {
  id: string;
  userId?: string | null;
  employeeCode: string;
  nationalId?: string | null;
  taxId?: string | null;
  positionId: string;
  positionName?: unknown;
  departmentId: string;
  departmentName?: unknown;
  managerId?: string | null;
  managerCode?: string | null;
  managerFirstName?: string | null;
  managerLastName?: string | null;
  employmentStatus: string;
  employmentType?: string | null;
  hireDate: string;
  probationEndDate?: string | null;
  baseSalary?: number | null;
  currency?: string | null;
  locationId?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  userFirstName?: string | null;
  userLastName?: string | null;
  userDateOfBirth?: Date | null;
  userGender?: string | null;
  userAddress?: unknown;
  userLoginEmail?: string | null;
  userLoginPhone?: string | null;
};

export default class EmployeeModel extends BaseModel<typeof hrm_tb_employees> {
  constructor() {
    super(hrm_tb_employees);
  }

  private selectShape = () => ({
    id: this.table.id,
    userId: this.table.userId,
    employeeCode: this.table.employeeCode,
    nationalId: this.table.nationalId,
    taxId: this.table.taxId,
    positionId: this.table.positionId,
    positionName: position.name,
    departmentId: this.table.departmentId,
    departmentName: department.name,
    managerId: this.table.managerId,
    managerCode: manager.employeeCode,
    managerFirstName: managerUser.firstName,
    managerLastName: managerUser.lastName,
    employmentStatus: this.table.employmentStatus,
    employmentType: this.table.employmentType,
    hireDate: this.table.hireDate,
    probationEndDate: this.table.probationEndDate,
    baseSalary: this.table.baseSalary,
    currency: this.table.currency,
    locationId: this.table.locationId,
    bankAccount: this.table.bankAccount,
    bankName: this.table.bankName,
    bankBranch: this.table.bankBranch,
    emergencyContactName: this.table.emergencyContactName,
    emergencyContactPhone: this.table.emergencyContactPhone,
    isActive: this.table.isActive,
    createdAt: this.table.createdAt,
    updatedAt: this.table.updatedAt,
    userFirstName: user.firstName,
    userLastName: user.lastName,
    userDateOfBirth: user.dateOfBirth,
    userGender: user.gender,
    userAddress: user.address,
    userLoginEmail: userLogin.email,
    userLoginPhone: userLogin.phone,
  });

  private baseQuery = () =>
    this.db
      .select(this.selectShape())
      .from(this.table)
      .leftJoin(position, eq(this.table.positionId, position.id))
      .leftJoin(department, eq(this.table.departmentId, department.id))
      .leftJoin(manager, eq(this.table.managerId, manager.id))
      .leftJoin(user, eq(this.table.userId, user.id))
      .leftJoin(userLogin, eq(user.id, userLogin.userId))
      .leftJoin(managerUser, eq(manager.userId, managerUser.id));

  private mapRow(r: DbRow): EmployeeRow {
    const fullName = buildFullName(r.userFirstName ?? null, r.userLastName ?? null);
    const managerFullName =
      r.managerFirstName != null || r.managerLastName != null
        ? buildFullName(r.managerFirstName ?? null, r.managerLastName ?? null)
        : undefined;
    return {
      id: r.id,
      userId: r.userId ?? undefined,
      employeeCode: r.employeeCode,
      firstName: r.userFirstName ?? undefined,
      lastName: r.userLastName ?? undefined,
      fullName: fullName || undefined,
      email: r.userLoginEmail ?? undefined,
      phone: r.userLoginPhone ?? undefined,
      dateOfBirth: r.userDateOfBirth?.toISOString().slice(0, 10) ?? undefined,
      gender: r.userGender ?? undefined,
      nationalId: r.nationalId ?? undefined,
      taxId: r.taxId ?? undefined,
      address: r.userAddress,
      positionId: r.positionId,
      position: r.positionId ? { id: r.positionId, name: r.positionName ?? undefined } : null,
      departmentId: r.departmentId,
      department: r.departmentId ? { id: r.departmentId, name: r.departmentName ?? undefined } : null,
      managerId: r.managerId ?? undefined,
      manager:
        r.managerId != null
          ? { id: r.managerId, employeeCode: r.managerCode ?? undefined, fullName: managerFullName ?? undefined }
          : null,
      employmentStatus: r.employmentStatus,
      employmentType: r.employmentType ?? undefined,
      hireDate: r.hireDate,
      probationEndDate: r.probationEndDate ?? undefined,
      baseSalary: r.baseSalary ?? undefined,
      currency: r.currency ?? undefined,
      locationId: r.locationId ?? undefined,
      bankAccount: r.bankAccount ?? undefined,
      bankName: r.bankName ?? undefined,
      bankBranch: r.bankBranch ?? undefined,
      emergencyContactName: r.emergencyContactName ?? undefined,
      emergencyContactPhone: r.emergencyContactPhone ?? undefined,
      isActive: r.isActive ?? undefined,
      createdAt: r.createdAt?.getTime(),
      updatedAt: r.updatedAt?.getTime(),
    };
  }

  private getOne = async (where: ReturnType<typeof eq>) => {
    const [row] = await this.baseQuery().where(where).limit(1);
    return row ? this.mapRow(row as DbRow) : null;
  };

  getEmployeeById = (id: string) => this.getOne(eq(this.table.id, id));
  getDataById = (params: { id: string }) => this.getEmployeeById(params.id);
  getByUserId = (params: { userId: string }) =>
    this.getOne(eq(this.table.userId, params.userId));

  create = async (payload: Record<string, unknown>): Promise<EmployeeRow> => {
    const p = normalizePayload(payload) as EmployeeInput;
    const now = new Date();
    const row: NewHrmTbEmployee = {
      userId: p.userId ?? null,
      employeeCode: p.employeeCode,
      nationalId: p.nationalId ?? null,
      taxId: p.taxId ?? null,
      positionId: p.positionId,
      departmentId: p.departmentId,
      managerId: p.managerId ?? null,
      employmentStatus: p.employmentStatus ?? "active",
      employmentType: p.employmentType ?? null,
      hireDate: p.hireDate,
      probationEndDate: p.probationEndDate ?? null,
      baseSalary: p.baseSalary ?? null,
      currency: p.currency ?? "VND",
      locationId: p.locationId ?? null,
      bankAccount: p.bankAccount ?? null,
      bankName: p.bankName ?? null,
      bankBranch: p.bankBranch ?? null,
      emergencyContactName: p.emergencyContactName ?? null,
      emergencyContactPhone: p.emergencyContactPhone ?? null,
      isActive: p.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    const [created] = await this.db.insert(this.table).values(row).returning({ id: this.table.id });
    if (!created) throw new Error("Failed to create employee");
    const out = await this.getEmployeeById(created.id);
    if (!out) throw new Error("Failed to load employee after creation");
    return out;
  };

  update = async (params: Record<string, unknown>): Promise<EmployeeRow | null> => {
    const id = params.id as string;
    const { id: _id, ...rest } = params;
    return this.updateData({ id, payload: rest });
  };

  updateEmployee = async (
    id: string,
    payload: Partial<EmployeeInput>,
  ): Promise<EmployeeRow | null> => {
    const set: Partial<NewHrmTbEmployee> = { updatedAt: new Date() };
    const keys: (keyof EmployeeInput)[] = [
      "userId",
      "employeeCode",
      "nationalId",
      "taxId",
      "positionId",
      "departmentId",
      "managerId",
      "employmentStatus",
      "employmentType",
      "hireDate",
      "probationEndDate",
      "baseSalary",
      "currency",
      "locationId",
      "bankAccount",
      "bankName",
      "bankBranch",
      "emergencyContactName",
      "emergencyContactPhone",
      "isActive",
    ];
    for (const k of keys) {
      if (payload[k] === undefined) continue;
      (set as any)[k] = payload[k] ?? null;
    }
    await this.db.update(this.table).set(set).where(eq(this.table.id, id));
    return this.getEmployeeById(id);
  };

  updateData = async (params: { id: string; payload: Record<string, unknown> }) => {
    const normalized = normalizePayload(params.payload, { partial: true });
    return this.updateEmployee(params.id, normalized as Partial<EmployeeInput>);
  };
}
