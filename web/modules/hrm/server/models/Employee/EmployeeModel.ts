import type { NextRequest } from "next/server";

import { hash } from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { BaseModel, PermissionRequired } from "@base/server/models/BaseModel";
import {
  base_tb_users,
  base_tb_users_login,
} from "@base/server/schemas/base.user";
import UserRoleModel from "@/module-base/server/models/UserRole/UserRoleModel";

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
  commonName: string | null;
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
    commonName: this.table.commonName,
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
      commonName: r.commonName,
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
    if (!userId) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.RESOURCE_NOT_FOUND,
        "Employee not found",
      );
    }
    return this.getOne(eq(this.table.id, userId));
  };

  /**
   * Create employee = Register user (users + users_login) + create employee record + assign roles.
   * loginIdentifier: email or username for login (must be unique; checked before create).
   * nationalId: required (CCCD/định danh cá nhân).
   */
  @PermissionRequired({ auth: true, permissions: ["hrm.employee.create"] })
  create = async (
    params: {
      loginIdentifier: string;
      password: string;
      emails?: string[] | null;
      phones?: string[] | null;
      firstName?: string | null;
      lastName?: string | null;
      commonName?: string | null;
      bio?: string | null;
      address?: Record<string, unknown> | null;
      dateOfBirth?: string | null;
      gender?: string | null;
      notes?: string | null;
      educationLevel?: string | null;
      experience?: string | null;
      employeeCode: string;
      nationalId: string;
      taxId?: string | null;
      positionId: string;
      departmentId: string;
      employmentStatus?: string | null;
      hireDate?: string | null;
      probationEndDate?: string | null;
      bankAccount?: string | null;
      bankName?: string | null;
      bankBranch?: string | null;
      emergencyContactName?: string | null;
      emergencyContactPhone?: string | null;
      roleIds?: string[];
      permissionIds?: string[];
      createdBy?: string;
    },
    request?: NextRequest,
  ): Promise<{ data: EmployeeRow }> => {
    const createdBy = params.createdBy ?? request?.headers.get("x-user-id") ?? null;
    const loginIdentifier = (params.loginIdentifier ?? "").trim();
    if (!loginIdentifier) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.VALIDATION_ERROR,
        "Login identifier (email or username) is required",
      );
    }
    const password = params.password ?? "";
    if (password.length < 6) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.VALIDATION_ERROR,
        "Password must be at least 6 characters",
      );
    }
    const nationalId = (params.nationalId ?? "").trim();
    if (!nationalId) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.VALIDATION_ERROR,
        "National ID (CCCD) is required",
      );
    }

    const [existingLogin] = await this.db
      .select({ id: base_tb_users_login.userId })
      .from(base_tb_users_login)
      .where(
        or(
          eq(base_tb_users_login.email, loginIdentifier.toLowerCase()),
          eq(base_tb_users_login.username, loginIdentifier),
        ),
      )
      .limit(1);
    if (existingLogin) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.VALIDATION_ERROR,
        "Login identifier already exists",
      );
    }

    const now = new Date();
    const result = await this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(this.table)
        .values({
          firstName: params.firstName?.trim() || null,
          lastName: params.lastName?.trim() || null,
          commonName: params.commonName?.trim() || null,
          emails: params.emails?.length ? params.emails : null,
          phones: params.phones?.length ? params.phones : null,
          address: params.address ?? null,
          dateOfBirth: params.dateOfBirth
            ? new Date(params.dateOfBirth)
            : null,
          gender: params.gender?.trim() || null,
          bio: params.bio?.trim() || null,
          notes: params.notes?.trim() || null,
          status: "active",
          createdAt: now,
          updatedAt: now,
          createdBy,
          updatedBy: createdBy,
        })
        .returning({ id: this.table.id });

      if (!user?.id) {
        throw new JsonRpcError(
          JSON_RPC_ERROR_CODES.INTERNAL_ERROR,
          "Failed to create user",
        );
      }

      const passwordHash = await hash(password, 10);
      const isEmail = loginIdentifier.includes("@");
      await tx.insert(base_tb_users_login).values({
        userId: user.id,
        email: isEmail ? loginIdentifier.toLowerCase() : null,
        username: !isEmail ? loginIdentifier : null,
        passwordHash,
        createdAt: now,
        updatedAt: now,
        createdBy,
        updatedBy: createdBy,
      });

      const [employeeRow] = await tx
        .insert(hrm_tb_employees)
        .values({
          userId: user.id,
          code: params.employeeCode.trim(),
          nationalId: nationalId,
          taxId: params.taxId?.trim() || null,
          positionId: params.positionId.trim(),
          departmentId: params.departmentId.trim(),
          managerId: null,
          status: (params.employmentStatus?.trim() || "active") as string,
          type: null,
          hireDate: params.hireDate || null,
          probationEndDate: params.probationEndDate || null,
          bankAccount: params.bankAccount?.trim() || null,
          bankName: params.bankName?.trim() || null,
          bankBranch: params.bankBranch?.trim() || null,
          emergencyContactName: params.emergencyContactName?.trim() || null,
          emergencyContactPhone: params.emergencyContactPhone?.trim() || null,
          createdAt: now,
          updatedAt: now,
          createdBy,
          updatedBy: createdBy,
        })
        .returning();

      if (!employeeRow) {
        throw new JsonRpcError(
          JSON_RPC_ERROR_CODES.INTERNAL_ERROR,
          "Failed to create employee record",
        );
      }

      return { user, employeeRow };
    });

    if (params.roleIds?.length) {
      const userRoleModel = new UserRoleModel();
      for (const roleId of params.roleIds) {
        if (roleId?.trim()) {
          await userRoleModel.assignRole(
            result.user.id,
            roleId.trim(),
            createdBy ?? undefined,
          );
        }
      }
    }

    const row = await this.getOne(eq(this.table.id, result.user.id));
    if (!row) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.INTERNAL_ERROR,
        "Employee created but failed to load",
      );
    }
    return { data: row };
  };
}
