import { LocaleDataType } from "@base/shared/interface/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NewHrmTbEmployee, hrm_tb_employees } from "../../schemas";
import { hrm_tb_departments } from "../../schemas/hrm.department";
import { hrm_tb_positions } from "../../schemas/hrm.position";

const department = alias(hrm_tb_departments, "department");
const position = alias(hrm_tb_positions, "position");
const manager = alias(hrm_tb_employees, "manager");

export interface EmployeeRow {
  id: string;
  employeeCode: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: unknown;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationalId?: string | null;
  taxId?: string | null;
  address?: unknown;
  positionId: string;
  position?: {
    id: string;
    name?: unknown;
  } | null;
  departmentId: string;
  department?: {
    id: string;
    name?: unknown;
  } | null;
  managerId?: string | null;
  manager?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  employmentStatus: string;
  employmentType?: string | null;
  hireDate: string;
  probationEndDate?: string | null;
  baseSalary?: number | null;
  currency?: string | null;
  locationId?: string | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface EmployeeInput {
  employeeCode: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName: LocaleDataType<string>;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationalId?: string | null;
  taxId?: string | null;
  address?: unknown;
  positionId: string;
  departmentId: string;
  managerId?: string | null;
  employmentStatus?: string;
  employmentType?: string | null;
  hireDate: string;
  probationEndDate?: string | null;
  baseSalary?: number | null;
  currency?: string | null;
  locationId?: string | null;
  isActive?: boolean;
}

export default class EmployeeModel extends BaseModel<typeof hrm_tb_employees> {
  constructor() {
    super(hrm_tb_employees);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;

    return null;
  }

  getEmployeeById = async (id: string): Promise<EmployeeRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        employeeCode: this.table.employeeCode,
        firstName: this.table.firstName,
        lastName: this.table.lastName,
        fullName: this.table.fullName,
        email: this.table.email,
        phone: this.table.phone,
        dateOfBirth: this.table.dateOfBirth,
        gender: this.table.gender,
        nationalId: this.table.nationalId,
        taxId: this.table.taxId,
        address: this.table.address,
        positionId: this.table.positionId,
        positionName: position.name,
        departmentId: this.table.departmentId,
        departmentName: department.name,
        managerId: this.table.managerId,
        managerCode: manager.employeeCode,
        managerFullName: manager.fullName,
        employmentStatus: this.table.employmentStatus,
        employmentType: this.table.employmentType,
        hireDate: this.table.hireDate,
        probationEndDate: this.table.probationEndDate,
        baseSalary: this.table.baseSalary,
        currency: this.table.currency,
        locationId: this.table.locationId,
        isActive: this.table.isActive,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(position, eq(this.table.positionId, position.id))
      .leftJoin(department, eq(this.table.departmentId, department.id))
      .leftJoin(manager, eq(this.table.managerId, manager.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      employeeCode: row.employeeCode,
      firstName: row.firstName ?? undefined,
      lastName: row.lastName ?? undefined,
      fullName: row.fullName,
      email: row.email ?? undefined,
      phone: row.phone ?? undefined,
      dateOfBirth: row.dateOfBirth ?? undefined,
      gender: row.gender ?? undefined,
      nationalId: row.nationalId ?? undefined,
      taxId: row.taxId ?? undefined,
      address: row.address,
      positionId: row.positionId,
      position: row.positionId
        ? {
            id: row.positionId,
            name: row.positionName ?? undefined,
          }
        : null,
      departmentId: row.departmentId,
      department: row.departmentId
        ? {
            id: row.departmentId,
            name: row.departmentName ?? undefined,
          }
        : null,
      managerId: row.managerId ?? undefined,
      manager: row.managerId
        ? {
            id: row.managerId,
            employeeCode: row.managerCode ?? undefined,
            fullName: row.managerFullName ?? undefined,
          }
        : null,
      employmentStatus: row.employmentStatus,
      employmentType: row.employmentType ?? undefined,
      hireDate: row.hireDate,
      probationEndDate: row.probationEndDate ?? undefined,
      baseSalary: row.baseSalary ?? undefined,
      currency: row.currency ?? undefined,
      locationId: row.locationId ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: { id: string }): Promise<EmployeeRow | null> => {
    return this.getEmployeeById(params.id);
  };

  createEmployee = async (payload: EmployeeInput): Promise<EmployeeRow> => {
    const now = new Date();
    const insertData: NewHrmTbEmployee = {
      employeeCode: payload.employeeCode,
      firstName: payload.firstName ?? null,
      lastName: payload.lastName ?? null,
      fullName: payload.fullName,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      dateOfBirth: payload.dateOfBirth ?? null,
      gender: payload.gender ?? null,
      nationalId: payload.nationalId ?? null,
      taxId: payload.taxId ?? null,
      address: payload.address ?? null,
      positionId: payload.positionId,
      departmentId: payload.departmentId,
      managerId: payload.managerId ?? null,
      employmentStatus: payload.employmentStatus ?? "active",
      employmentType: payload.employmentType ?? null,
      hireDate: payload.hireDate,
      probationEndDate: payload.probationEndDate ?? null,
      baseSalary: payload.baseSalary ?? null,
      currency: payload.currency ?? "VND",
      locationId: payload.locationId ?? null,
      isActive:
        payload.isActive === undefined || payload.isActive === null
          ? true
          : payload.isActive,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) {
      throw new Error("Failed to create employee");
    }

    const row = await this.getEmployeeById(created.id);

    if (!row) {
      throw new Error("Failed to load employee after creation");
    }

    return row;
  };

  updateEmployee = async (
    id: string,
    payload: Partial<EmployeeInput>,
  ): Promise<EmployeeRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.employeeCode !== undefined)
      updateData.employeeCode = payload.employeeCode;
    if (payload.firstName !== undefined)
      updateData.firstName = payload.firstName ?? null;
    if (payload.lastName !== undefined)
      updateData.lastName = payload.lastName ?? null;
    if (payload.fullName !== undefined) updateData.fullName = payload.fullName;
    if (payload.email !== undefined) updateData.email = payload.email ?? null;
    if (payload.phone !== undefined) updateData.phone = payload.phone ?? null;
    if (payload.dateOfBirth !== undefined)
      updateData.dateOfBirth = payload.dateOfBirth ?? null;
    if (payload.gender !== undefined)
      updateData.gender = payload.gender ?? null;
    if (payload.nationalId !== undefined)
      updateData.nationalId = payload.nationalId ?? null;
    if (payload.taxId !== undefined) updateData.taxId = payload.taxId ?? null;
    if (payload.address !== undefined)
      updateData.address = payload.address ?? null;
    if (payload.positionId !== undefined)
      updateData.positionId = payload.positionId;
    if (payload.departmentId !== undefined)
      updateData.departmentId = payload.departmentId;
    if (payload.managerId !== undefined)
      updateData.managerId = payload.managerId ?? null;
    if (payload.employmentStatus !== undefined)
      updateData.employmentStatus = payload.employmentStatus;
    if (payload.employmentType !== undefined)
      updateData.employmentType = payload.employmentType ?? null;
    if (payload.hireDate !== undefined) updateData.hireDate = payload.hireDate;
    if (payload.probationEndDate !== undefined)
      updateData.probationEndDate = payload.probationEndDate ?? null;
    if (payload.baseSalary !== undefined)
      updateData.baseSalary = payload.baseSalary ?? null;
    if (payload.currency !== undefined)
      updateData.currency = payload.currency ?? null;
    if (payload.locationId !== undefined)
      updateData.locationId = payload.locationId ?? null;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getEmployeeById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;

    const normalizedPayload: Partial<EmployeeInput> = {};

    if (payload.employeeCode !== undefined) {
      normalizedPayload.employeeCode = String(payload.employeeCode);
    }
    if (payload.firstName !== undefined) {
      normalizedPayload.firstName =
        payload.firstName === null || payload.firstName === ""
          ? null
          : String(payload.firstName);
    }
    if (payload.lastName !== undefined) {
      normalizedPayload.lastName =
        payload.lastName === null || payload.lastName === ""
          ? null
          : String(payload.lastName);
    }
    if (payload.fullName !== undefined) {
      normalizedPayload.fullName = this.normalizeLocaleInput(
        payload.fullName,
      ) ?? {
        en: "",
      };
    }
    if (payload.email !== undefined) {
      normalizedPayload.email =
        payload.email === null || payload.email === ""
          ? null
          : String(payload.email);
    }
    if (payload.phone !== undefined) {
      normalizedPayload.phone =
        payload.phone === null || payload.phone === ""
          ? null
          : String(payload.phone);
    }
    if (payload.dateOfBirth !== undefined) {
      normalizedPayload.dateOfBirth =
        payload.dateOfBirth === null || payload.dateOfBirth === ""
          ? null
          : String(payload.dateOfBirth);
    }
    if (payload.gender !== undefined) {
      normalizedPayload.gender =
        payload.gender === null || payload.gender === ""
          ? null
          : String(payload.gender);
    }
    if (payload.nationalId !== undefined) {
      normalizedPayload.nationalId =
        payload.nationalId === null || payload.nationalId === ""
          ? null
          : String(payload.nationalId);
    }
    if (payload.taxId !== undefined) {
      normalizedPayload.taxId =
        payload.taxId === null || payload.taxId === ""
          ? null
          : String(payload.taxId);
    }
    if (payload.address !== undefined) {
      normalizedPayload.address = payload.address;
    }
    if (payload.positionId !== undefined) {
      normalizedPayload.positionId = String(payload.positionId);
    }
    if (payload.departmentId !== undefined) {
      normalizedPayload.departmentId = String(payload.departmentId);
    }
    if (payload.managerId !== undefined) {
      normalizedPayload.managerId =
        payload.managerId === null || payload.managerId === ""
          ? null
          : String(payload.managerId);
    }
    if (payload.employmentStatus !== undefined) {
      normalizedPayload.employmentStatus = String(payload.employmentStatus);
    }
    if (payload.employmentType !== undefined) {
      normalizedPayload.employmentType =
        payload.employmentType === null || payload.employmentType === ""
          ? null
          : String(payload.employmentType);
    }
    if (payload.hireDate !== undefined) {
      normalizedPayload.hireDate = String(payload.hireDate);
    }
    if (payload.probationEndDate !== undefined) {
      normalizedPayload.probationEndDate =
        payload.probationEndDate === null || payload.probationEndDate === ""
          ? null
          : String(payload.probationEndDate);
    }
    if (payload.baseSalary !== undefined) {
      normalizedPayload.baseSalary =
        payload.baseSalary === null || payload.baseSalary === ""
          ? null
          : Number(payload.baseSalary);
    }
    if (payload.currency !== undefined) {
      normalizedPayload.currency =
        payload.currency === null || payload.currency === ""
          ? null
          : String(payload.currency);
    }
    if (payload.locationId !== undefined) {
      normalizedPayload.locationId =
        payload.locationId === null || payload.locationId === ""
          ? null
          : String(payload.locationId);
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updateEmployee(id, normalizedPayload);
  };
}
