import { eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { LocaleDataType } from "@base/shared/interface/Locale";
import { BaseModel } from "@base/server/models/BaseModel";

import { NewHrmTbCertificate, hrm_tb_certificates } from "../../schemas";
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
  documentUrl?: string | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface CertificateInput {
  employeeId: string;
  name: LocaleDataType<string>;
  issuer: string;
  certificateNumber?: string | null;
  issueDate: string;
  expiryDate?: string | null;
  documentUrl?: string | null;
  isActive?: boolean;
}

export default class CertificateModel extends BaseModel<
  typeof hrm_tb_certificates
> {
  constructor() {
    super(hrm_tb_certificates);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;

    return null;
  }

  getCertificateById = async (id: string): Promise<CertificateRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        employeeId: this.table.employeeId,
        employeeCode: employee.code,
        employeeFullName: sql<string>`''`.as("employeeFullName"),
        name: this.table.name,
        issuer: this.table.issuer,
        certificateNumber: this.table.certificateNumber,
        issueDate: this.table.issueDate,
        expiryDate: this.table.expiryDate,
        documentUrl: this.table.documentUrl,
        isActive: this.table.isActive,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(employee, eq(this.table.employeeId, employee.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) return null;

    return {
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
      documentUrl: row.documentUrl ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: {
    id: string;
  }): Promise<CertificateRow | null> => {
    return this.getCertificateById(params.id);
  };

  createCertificate = async (
    payload: CertificateInput,
  ): Promise<CertificateRow> => {
    const now = new Date();
    const insertData: NewHrmTbCertificate = {
      employeeId: payload.employeeId,
      name: payload.name,
      issuer: payload.issuer,
      certificateNumber: payload.certificateNumber ?? null,
      issueDate: payload.issueDate,
      expiryDate: payload.expiryDate ?? null,
      documentUrl: payload.documentUrl ?? null,
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create certificate");

    const certificate = await this.getCertificateById(created.id);

    if (!certificate)
      throw new Error("Failed to load certificate after creation");

    return certificate;
  };

  updateCertificate = async (
    id: string,
    payload: Partial<CertificateInput>,
  ): Promise<CertificateRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.employeeId !== undefined)
      updateData.employeeId = payload.employeeId;
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.issuer !== undefined) updateData.issuer = payload.issuer;
    if (payload.certificateNumber !== undefined)
      updateData.certificateNumber = payload.certificateNumber ?? null;
    if (payload.issueDate !== undefined)
      updateData.issueDate = payload.issueDate;
    if (payload.expiryDate !== undefined)
      updateData.expiryDate = payload.expiryDate ?? null;
    if (payload.documentUrl !== undefined)
      updateData.documentUrl = payload.documentUrl ?? null;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getCertificateById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<CertificateInput> = {};

    if (payload.employeeId !== undefined) {
      normalizedPayload.employeeId = String(payload.employeeId);
    }
    if (payload.name !== undefined) {
      normalizedPayload.name = this.normalizeLocaleInput(payload.name) ?? {
        en: "",
      };
    }
    if (payload.issuer !== undefined) {
      normalizedPayload.issuer = String(payload.issuer);
    }
    if (payload.certificateNumber !== undefined) {
      normalizedPayload.certificateNumber =
        payload.certificateNumber === null || payload.certificateNumber === ""
          ? null
          : String(payload.certificateNumber);
    }
    if (payload.issueDate !== undefined) {
      normalizedPayload.issueDate = String(payload.issueDate);
    }
    if (payload.expiryDate !== undefined) {
      normalizedPayload.expiryDate =
        payload.expiryDate === null || payload.expiryDate === ""
          ? null
          : String(payload.expiryDate);
    }
    if (payload.documentUrl !== undefined) {
      normalizedPayload.documentUrl =
        payload.documentUrl === null || payload.documentUrl === ""
          ? null
          : String(payload.documentUrl);
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updateCertificate(id, normalizedPayload);
  };
}
