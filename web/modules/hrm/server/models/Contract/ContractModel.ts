import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NewHrmTbContract, hrm_tb_contracts } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";

const employee = alias(hrm_tb_employees, "employee");
const signedByEmployee = alias(hrm_tb_employees, "signed_by_employee");

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
  currency?: string | null;
  workingHours?: number | null;
  probationPeriod?: number | null;
  probationEndDate?: string | null;
  status: string;
  documentUrl?: string | null;
  signedDate?: string | null;
  signedBy?: string | null;
  signedByEmployee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  notes?: string | null;
  metadata?: unknown;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface ContractInput {
  contractNumber: string;
  employeeId: string;
  contractType: string;
  startDate: string;
  endDate?: string | null;
  baseSalary: number;
  currency?: string | null;
  workingHours?: number | null;
  probationPeriod?: number | null;
  probationEndDate?: string | null;
  status?: string;
  documentUrl?: string | null;
  signedDate?: string | null;
  signedBy?: string | null;
  notes?: string | null;
  metadata?: unknown;
  isActive?: boolean;
}

export default class ContractModel extends BaseModel<typeof hrm_tb_contracts> {
  constructor() {
    super(hrm_tb_contracts);
  }

  getContractById = async (id: string): Promise<ContractRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        contractNumber: this.table.contractNumber,
        employeeId: this.table.employeeId,
        employeeCode: employee.employeeCode,
        employeeFullName: employee.fullName,
        contractType: this.table.contractType,
        startDate: this.table.startDate,
        endDate: this.table.endDate,
        baseSalary: this.table.baseSalary,
        currency: this.table.currency,
        workingHours: this.table.workingHours,
        probationPeriod: this.table.probationPeriod,
        probationEndDate: this.table.probationEndDate,
        status: this.table.status,
        documentUrl: this.table.documentUrl,
        signedDate: this.table.signedDate,
        signedBy: this.table.signedBy,
        signedByCode: signedByEmployee.employeeCode,
        signedByFullName: signedByEmployee.fullName,
        notes: this.table.notes,
        metadata: this.table.metadata,
        isActive: this.table.isActive,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(employee, eq(this.table.employeeId, employee.id))
      .leftJoin(signedByEmployee, eq(this.table.signedBy, signedByEmployee.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) {
      return null;
    }

    return {
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
      currency: row.currency ?? undefined,
      workingHours: row.workingHours ?? undefined,
      probationPeriod: row.probationPeriod ?? undefined,
      probationEndDate: row.probationEndDate ?? undefined,
      status: row.status,
      documentUrl: row.documentUrl ?? undefined,
      signedDate: row.signedDate ?? undefined,
      signedBy: row.signedBy ?? undefined,
      signedByEmployee: row.signedBy
        ? {
            id: row.signedBy,
            employeeCode: row.signedByCode ?? undefined,
            fullName: row.signedByFullName ?? undefined,
          }
        : null,
      notes: row.notes ?? undefined,
      metadata: row.metadata,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: { id: string }): Promise<ContractRow | null> => {
    return this.getContractById(params.id);
  };

  createContract = async (payload: ContractInput): Promise<ContractRow> => {
    const now = new Date();
    const insertData: NewHrmTbContract = {
      contractNumber: payload.contractNumber,
      employeeId: payload.employeeId,
      contractType: payload.contractType,
      startDate: payload.startDate,
      endDate: payload.endDate ?? null,
      baseSalary: payload.baseSalary,
      currency: payload.currency ?? "VND",
      workingHours: payload.workingHours ?? 40,
      probationPeriod: payload.probationPeriod ?? null,
      probationEndDate: payload.probationEndDate ?? null,
      status: payload.status ?? "active",
      documentUrl: payload.documentUrl ?? null,
      signedDate: payload.signedDate ?? null,
      signedBy: payload.signedBy ?? null,
      notes: payload.notes ?? null,
      metadata: payload.metadata ?? null,
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
      throw new Error("Failed to create contract");
    }

    const row = await this.getContractById(created.id);

    if (!row) {
      throw new Error("Failed to load contract after creation");
    }

    return row;
  };

  updateContract = async (
    id: string,
    payload: Partial<ContractInput>,
  ): Promise<ContractRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.contractNumber !== undefined)
      updateData.contractNumber = payload.contractNumber;
    if (payload.employeeId !== undefined)
      updateData.employeeId = payload.employeeId;
    if (payload.contractType !== undefined)
      updateData.contractType = payload.contractType;
    if (payload.startDate !== undefined)
      updateData.startDate = payload.startDate;
    if (payload.endDate !== undefined)
      updateData.endDate = payload.endDate ?? null;
    if (payload.baseSalary !== undefined)
      updateData.baseSalary = payload.baseSalary;
    if (payload.currency !== undefined)
      updateData.currency = payload.currency ?? null;
    if (payload.workingHours !== undefined)
      updateData.workingHours = payload.workingHours ?? null;
    if (payload.probationPeriod !== undefined)
      updateData.probationPeriod = payload.probationPeriod ?? null;
    if (payload.probationEndDate !== undefined)
      updateData.probationEndDate = payload.probationEndDate ?? null;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.documentUrl !== undefined)
      updateData.documentUrl = payload.documentUrl ?? null;
    if (payload.signedDate !== undefined)
      updateData.signedDate = payload.signedDate ?? null;
    if (payload.signedBy !== undefined)
      updateData.signedBy = payload.signedBy ?? null;
    if (payload.notes !== undefined) updateData.notes = payload.notes ?? null;
    if (payload.metadata !== undefined)
      updateData.metadata = payload.metadata ?? null;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getContractById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;

    const normalizedPayload: Partial<ContractInput> = {};

    if (payload.contractNumber !== undefined) {
      normalizedPayload.contractNumber = String(payload.contractNumber);
    }
    if (payload.employeeId !== undefined) {
      normalizedPayload.employeeId = String(payload.employeeId);
    }
    if (payload.contractType !== undefined) {
      normalizedPayload.contractType = String(payload.contractType);
    }
    if (payload.startDate !== undefined) {
      normalizedPayload.startDate = String(payload.startDate);
    }
    if (payload.endDate !== undefined) {
      normalizedPayload.endDate =
        payload.endDate === null || payload.endDate === ""
          ? null
          : String(payload.endDate);
    }
    if (payload.baseSalary !== undefined) {
      normalizedPayload.baseSalary = Number(payload.baseSalary);
    }
    if (payload.currency !== undefined) {
      normalizedPayload.currency =
        payload.currency === null || payload.currency === ""
          ? null
          : String(payload.currency);
    }
    if (payload.workingHours !== undefined) {
      normalizedPayload.workingHours =
        payload.workingHours === null || payload.workingHours === ""
          ? null
          : Number(payload.workingHours);
    }
    if (payload.probationPeriod !== undefined) {
      normalizedPayload.probationPeriod =
        payload.probationPeriod === null || payload.probationPeriod === ""
          ? null
          : Number(payload.probationPeriod);
    }
    if (payload.probationEndDate !== undefined) {
      normalizedPayload.probationEndDate =
        payload.probationEndDate === null || payload.probationEndDate === ""
          ? null
          : String(payload.probationEndDate);
    }
    if (payload.status !== undefined) {
      normalizedPayload.status = String(payload.status);
    }
    if (payload.documentUrl !== undefined) {
      normalizedPayload.documentUrl =
        payload.documentUrl === null || payload.documentUrl === ""
          ? null
          : String(payload.documentUrl);
    }
    if (payload.signedDate !== undefined) {
      normalizedPayload.signedDate =
        payload.signedDate === null || payload.signedDate === ""
          ? null
          : String(payload.signedDate);
    }
    if (payload.signedBy !== undefined) {
      normalizedPayload.signedBy =
        payload.signedBy === null || payload.signedBy === ""
          ? null
          : String(payload.signedBy);
    }
    if (payload.notes !== undefined) {
      normalizedPayload.notes =
        payload.notes === null || payload.notes === ""
          ? null
          : String(payload.notes);
    }
    if (payload.metadata !== undefined) {
      normalizedPayload.metadata = payload.metadata;
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updateContract(id, normalizedPayload);
  };
}
