import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { LocaleDataType } from "@base/shared/interface/Locale";
import { BaseModel } from "@base/server/models/BaseModel";

import { NewHrmTbDocument, hrm_tb_documents } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";

const employee = alias(hrm_tb_employees, "employee");

export interface DocumentRow {
  id: string;
  documentNumber?: string | null;
  documentType: string;
  title?: unknown;
  description?: unknown;
  employeeId?: string | null;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  signedDate?: number | null;
  expiryDate?: number | null;
  isDigitalSignature?: boolean;
  metadata?: unknown;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface DocumentInput {
  documentNumber?: string | null;
  documentType: string;
  title: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  employeeId?: string | null;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  signedDate?: string | null;
  expiryDate?: string | null;
  isDigitalSignature?: boolean;
  metadata?: unknown;
  isActive?: boolean;
}

export default class DocumentModel extends BaseModel<typeof hrm_tb_documents> {
  constructor() {
    super(hrm_tb_documents);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;

    return null;
  }

  getDocumentById = async (id: string): Promise<DocumentRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        documentNumber: this.table.documentNumber,
        documentType: this.table.documentType,
        title: this.table.title,
        description: this.table.description,
        employeeId: this.table.employeeId,
        employeeCode: employee.employeeCode,
        employeeFullName: employee.fullName,
        fileUrl: this.table.fileUrl,
        fileSize: this.table.fileSize,
        mimeType: this.table.mimeType,
        signedDate: this.table.signedDate,
        expiryDate: this.table.expiryDate,
        isDigitalSignature: this.table.isDigitalSignature,
        metadata: this.table.metadata,
        isActive: this.table.isActive,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(employee, eq(this.table.employeeId, employee.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      documentNumber: row.documentNumber ?? undefined,
      documentType: row.documentType,
      title: row.title,
      description: row.description,
      employeeId: row.employeeId ?? undefined,
      employee: row.employeeId
        ? {
            id: row.employeeId,
            employeeCode: row.employeeCode ?? undefined,
            fullName: row.employeeFullName ?? undefined,
          }
        : null,
      fileUrl: row.fileUrl,
      fileSize: row.fileSize ?? undefined,
      mimeType: row.mimeType ?? undefined,
      signedDate: row.signedDate?.getTime(),
      expiryDate: row.expiryDate?.getTime(),
      isDigitalSignature: row.isDigitalSignature ?? undefined,
      metadata: row.metadata,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: { id: string }): Promise<DocumentRow | null> => {
    return this.getDocumentById(params.id);
  };

  createDocument = async (payload: DocumentInput): Promise<DocumentRow> => {
    const now = new Date();
    const insertData: NewHrmTbDocument = {
      documentNumber: payload.documentNumber ?? null,
      documentType: payload.documentType,
      title: payload.title,
      description: payload.description
        ? typeof payload.description === "string"
          ? payload.description
          : JSON.stringify(payload.description)
        : null,
      employeeId: payload.employeeId ?? null,
      fileUrl: payload.fileUrl,
      fileSize: payload.fileSize ?? null,
      mimeType: payload.mimeType ?? null,
      signedDate: payload.signedDate ? new Date(payload.signedDate) : null,
      expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : null,
      isDigitalSignature: payload.isDigitalSignature ?? false,
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
      throw new Error("Failed to create document");
    }

    const row = await this.getDocumentById(created.id);

    if (!row) {
      throw new Error("Failed to load document after creation");
    }

    return row;
  };

  updateDocument = async (
    id: string,
    payload: Partial<DocumentInput>,
  ): Promise<DocumentRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.documentNumber !== undefined)
      updateData.documentNumber = payload.documentNumber ?? null;
    if (payload.documentType !== undefined)
      updateData.documentType = payload.documentType;
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.description !== undefined)
      updateData.description = payload.description
        ? typeof payload.description === "string"
          ? payload.description
          : JSON.stringify(payload.description)
        : null;
    if (payload.employeeId !== undefined)
      updateData.employeeId = payload.employeeId ?? null;
    if (payload.fileUrl !== undefined) updateData.fileUrl = payload.fileUrl;
    if (payload.fileSize !== undefined)
      updateData.fileSize = payload.fileSize ?? null;
    if (payload.mimeType !== undefined)
      updateData.mimeType = payload.mimeType ?? null;
    if (payload.signedDate !== undefined)
      updateData.signedDate = payload.signedDate
        ? new Date(payload.signedDate)
        : null;
    if (payload.expiryDate !== undefined)
      updateData.expiryDate = payload.expiryDate
        ? new Date(payload.expiryDate)
        : null;
    if (payload.isDigitalSignature !== undefined)
      updateData.isDigitalSignature = payload.isDigitalSignature;
    if (payload.metadata !== undefined)
      updateData.metadata = payload.metadata ?? null;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getDocumentById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;

    const normalizedPayload: Partial<DocumentInput> = {};

    if (payload.documentNumber !== undefined) {
      normalizedPayload.documentNumber =
        payload.documentNumber === null || payload.documentNumber === ""
          ? null
          : String(payload.documentNumber);
    }
    if (payload.documentType !== undefined) {
      normalizedPayload.documentType = String(payload.documentType);
    }
    if (payload.title !== undefined) {
      normalizedPayload.title = this.normalizeLocaleInput(payload.title) ?? {
        en: "",
      };
    }
    if (payload.description !== undefined) {
      normalizedPayload.description = this.normalizeLocaleInput(
        payload.description,
      );
    }
    if (payload.employeeId !== undefined) {
      normalizedPayload.employeeId =
        payload.employeeId === null || payload.employeeId === ""
          ? null
          : String(payload.employeeId);
    }
    if (payload.fileUrl !== undefined) {
      normalizedPayload.fileUrl = String(payload.fileUrl);
    }
    if (payload.fileSize !== undefined) {
      normalizedPayload.fileSize =
        payload.fileSize === null || payload.fileSize === ""
          ? null
          : Number(payload.fileSize);
    }
    if (payload.mimeType !== undefined) {
      normalizedPayload.mimeType =
        payload.mimeType === null || payload.mimeType === ""
          ? null
          : String(payload.mimeType);
    }
    if (payload.signedDate !== undefined) {
      normalizedPayload.signedDate =
        payload.signedDate === null || payload.signedDate === ""
          ? null
          : String(payload.signedDate);
    }
    if (payload.expiryDate !== undefined) {
      normalizedPayload.expiryDate =
        payload.expiryDate === null || payload.expiryDate === ""
          ? null
          : String(payload.expiryDate);
    }
    if (payload.isDigitalSignature !== undefined) {
      normalizedPayload.isDigitalSignature = Boolean(
        payload.isDigitalSignature,
      );
    }
    if (payload.metadata !== undefined) {
      normalizedPayload.metadata = payload.metadata;
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updateDocument(id, normalizedPayload);
  };
}
