import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NewTblCandidate, table_candidate } from "../../schemas";
import { table_job_requisition } from "../../schemas/job-requisition";

const requisition = alias(table_job_requisition, "requisition");

export interface CandidateRow {
  id: string;
  requisitionId: string;
  requisition?: {
    id: string;
    requisitionNumber?: string;
    title?: unknown;
  } | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: unknown;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: unknown;
  cvUrl?: string | null;
  coverLetter?: string | null;
  source?: string | null;
  status: string;
  stage?: string | null;
  rating?: number | null;
  notes?: string | null;
  appliedDate?: number | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface CandidateInput {
  requisitionId: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName: LocaleDataType<string>;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: unknown;
  cvUrl?: string | null;
  coverLetter?: string | null;
  source?: string | null;
  status?: string;
  stage?: string | null;
  rating?: number | null;
  notes?: string | null;
}

export default class CandidateModel extends BaseModel<typeof table_candidate> {
  constructor() {
    super(table_candidate);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;
    return null;
  }

  getCandidateById = async (id: string): Promise<CandidateRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        requisitionId: this.table.requisitionId,
        requisitionNumber: requisition.requisitionNumber,
        requisitionTitle: requisition.title,
        firstName: this.table.firstName,
        lastName: this.table.lastName,
        fullName: this.table.fullName,
        email: this.table.email,
        phone: this.table.phone,
        dateOfBirth: this.table.dateOfBirth,
        gender: this.table.gender,
        address: this.table.address,
        cvUrl: this.table.cvUrl,
        coverLetter: this.table.coverLetter,
        source: this.table.source,
        status: this.table.status,
        stage: this.table.stage,
        rating: this.table.rating,
        notes: this.table.notes,
        appliedDate: this.table.appliedDate,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(requisition, eq(this.table.requisitionId, requisition.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];
    if (!row) return null;

    return {
      id: row.id,
      requisitionId: row.requisitionId,
      requisition: row.requisitionId
        ? {
            id: row.requisitionId,
            requisitionNumber: row.requisitionNumber ?? undefined,
            title: row.requisitionTitle ?? undefined,
          }
        : null,
      firstName: row.firstName ?? undefined,
      lastName: row.lastName ?? undefined,
      fullName: row.fullName,
      email: row.email ?? undefined,
      phone: row.phone ?? undefined,
      dateOfBirth: row.dateOfBirth ?? undefined,
      gender: row.gender ?? undefined,
      address: row.address,
      cvUrl: row.cvUrl ?? undefined,
      coverLetter: row.coverLetter ?? undefined,
      source: row.source ?? undefined,
      status: row.status,
      stage: row.stage ?? undefined,
      rating: row.rating ?? undefined,
      notes: row.notes ?? undefined,
      appliedDate: row.appliedDate?.getTime(),
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: { id: string }): Promise<CandidateRow | null> => {
    return this.getCandidateById(params.id);
  };

  createCandidate = async (payload: CandidateInput): Promise<CandidateRow> => {
    const now = new Date();
    const insertData: NewTblCandidate = {
      requisitionId: payload.requisitionId,
      firstName: payload.firstName ?? null,
      lastName: payload.lastName ?? null,
      fullName: payload.fullName,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      dateOfBirth: payload.dateOfBirth ?? null,
      gender: payload.gender ?? null,
      address: payload.address ?? null,
      cvUrl: payload.cvUrl ?? null,
      coverLetter: payload.coverLetter ?? null,
      source: payload.source ?? null,
      status: payload.status ?? "applied",
      stage: payload.stage ?? null,
      rating: payload.rating ?? null,
      notes: payload.notes ?? null,
      appliedDate: now,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create candidate");

    const candidate = await this.getCandidateById(created.id);
    if (!candidate) throw new Error("Failed to load candidate after creation");
    return candidate;
  };

  updateCandidate = async (
    id: string,
    payload: Partial<CandidateInput>
  ): Promise<CandidateRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.requisitionId !== undefined)
      updateData.requisitionId = payload.requisitionId;
    if (payload.firstName !== undefined)
      updateData.firstName = payload.firstName ?? null;
    if (payload.lastName !== undefined)
      updateData.lastName = payload.lastName ?? null;
    if (payload.fullName !== undefined) updateData.fullName = payload.fullName;
    if (payload.email !== undefined) updateData.email = payload.email ?? null;
    if (payload.phone !== undefined) updateData.phone = payload.phone ?? null;
    if (payload.dateOfBirth !== undefined)
      updateData.dateOfBirth = payload.dateOfBirth ?? null;
    if (payload.gender !== undefined) updateData.gender = payload.gender ?? null;
    if (payload.address !== undefined)
      updateData.address = payload.address ?? null;
    if (payload.cvUrl !== undefined) updateData.cvUrl = payload.cvUrl ?? null;
    if (payload.coverLetter !== undefined)
      updateData.coverLetter = payload.coverLetter ?? null;
    if (payload.source !== undefined) updateData.source = payload.source ?? null;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.stage !== undefined) updateData.stage = payload.stage ?? null;
    if (payload.rating !== undefined) updateData.rating = payload.rating ?? null;
    if (payload.notes !== undefined) updateData.notes = payload.notes ?? null;

    await this.db.update(this.table).set(updateData).where(eq(this.table.id, id));
    return this.getCandidateById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<CandidateInput> = {};

    if (payload.requisitionId !== undefined) {
      normalizedPayload.requisitionId = String(payload.requisitionId);
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
      normalizedPayload.fullName = this.normalizeLocaleInput(payload.fullName) ?? {
        en: "",
      };
    }
    if (payload.email !== undefined) {
      normalizedPayload.email =
        payload.email === null || payload.email === "" ? null : String(payload.email);
    }
    if (payload.phone !== undefined) {
      normalizedPayload.phone =
        payload.phone === null || payload.phone === "" ? null : String(payload.phone);
    }
    if (payload.dateOfBirth !== undefined) {
      normalizedPayload.dateOfBirth =
        payload.dateOfBirth === null || payload.dateOfBirth === ""
          ? null
          : String(payload.dateOfBirth);
    }
    if (payload.gender !== undefined) {
      normalizedPayload.gender =
        payload.gender === null || payload.gender === "" ? null : String(payload.gender);
    }
    if (payload.address !== undefined) {
      normalizedPayload.address = payload.address;
    }
    if (payload.cvUrl !== undefined) {
      normalizedPayload.cvUrl =
        payload.cvUrl === null || payload.cvUrl === "" ? null : String(payload.cvUrl);
    }
    if (payload.coverLetter !== undefined) {
      normalizedPayload.coverLetter =
        payload.coverLetter === null || payload.coverLetter === ""
          ? null
          : String(payload.coverLetter);
    }
    if (payload.source !== undefined) {
      normalizedPayload.source =
        payload.source === null || payload.source === "" ? null : String(payload.source);
    }
    if (payload.status !== undefined) {
      normalizedPayload.status = String(payload.status);
    }
    if (payload.stage !== undefined) {
      normalizedPayload.stage =
        payload.stage === null || payload.stage === "" ? null : String(payload.stage);
    }
    if (payload.rating !== undefined) {
      normalizedPayload.rating =
        payload.rating === null || payload.rating === ""
          ? null
          : Number(payload.rating);
    }
    if (payload.notes !== undefined) {
      normalizedPayload.notes =
        payload.notes === null || payload.notes === "" ? null : String(payload.notes);
    }

    return this.updateCandidate(id, normalizedPayload);
  };
}

