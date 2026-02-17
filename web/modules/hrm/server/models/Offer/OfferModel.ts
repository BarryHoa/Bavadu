import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { LocaleDataType } from "@base/shared/interface/Locale";
import { BaseModel } from "@base/server/models/BaseModel";

import { NewHrmTbOffer, hrm_tb_offers } from "../../schemas";
import { hrm_tb_candidates } from "../../schemas/hrm.candidate";

const candidate = alias(hrm_tb_candidates, "candidate");

export interface OfferRow {
  id: string;
  candidateId: string;
  candidate?: {
    id: string;
    fullName?: unknown;
  } | null;
  offerNumber: string;
  positionTitle?: unknown;
  baseSalary: number;
  currency?: string | null;
  startDate: string;
  employmentType?: string | null;
  benefits?: unknown;
  terms?: string | null;
  status: string;
  sentDate?: number | null;
  expiryDate?: string | null;
  acceptedDate?: number | null;
  rejectedDate?: number | null;
  rejectionReason?: string | null;
  approvedBy?: string | null;
  approvedAt?: number | null;
  notes?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface OfferInput {
  candidateId: string;
  offerNumber: string;
  positionTitle: LocaleDataType<string>;
  baseSalary: number;
  currency?: string | null;
  startDate: string;
  employmentType?: string | null;
  benefits?: unknown;
  terms?: string | null;
  status?: string;
  expiryDate?: string | null;
  notes?: string | null;
}

export default class OfferModel extends BaseModel<typeof hrm_tb_offers> {
  constructor() {
    super(hrm_tb_offers);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;

    return null;
  }

  getOfferById = async (id: string): Promise<OfferRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        candidateId: this.table.candidateId,
        candidateFullName: candidate.fullName,
        offerNumber: this.table.offerNumber,
        positionTitle: this.table.positionTitle,
        baseSalary: this.table.baseSalary,
        currency: this.table.currency,
        startDate: this.table.startDate,
        employmentType: this.table.employmentType,
        benefits: this.table.benefits,
        terms: this.table.terms,
        status: this.table.status,
        sentDate: this.table.sentDate,
        expiryDate: this.table.expiryDate,
        acceptedDate: this.table.acceptedDate,
        rejectedDate: this.table.rejectedDate,
        rejectionReason: this.table.rejectionReason,
        approvedBy: this.table.approvedBy,
        approvedAt: this.table.approvedAt,
        notes: this.table.notes,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(candidate, eq(this.table.candidateId, candidate.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) return null;

    return {
      id: row.id,
      candidateId: row.candidateId,
      candidate: row.candidateId
        ? {
            id: row.candidateId,
            fullName: row.candidateFullName ?? undefined,
          }
        : null,
      offerNumber: row.offerNumber,
      positionTitle: row.positionTitle,
      baseSalary: row.baseSalary,
      currency: row.currency ?? undefined,
      startDate: row.startDate,
      employmentType: row.employmentType ?? undefined,
      benefits: row.benefits,
      terms: row.terms ?? undefined,
      status: row.status,
      sentDate: row.sentDate?.getTime(),
      expiryDate: row.expiryDate ?? undefined,
      acceptedDate: row.acceptedDate?.getTime(),
      rejectedDate: row.rejectedDate?.getTime(),
      rejectionReason: row.rejectionReason ?? undefined,
      approvedBy: row.approvedBy ?? undefined,
      approvedAt: row.approvedAt?.getTime(),
      notes: row.notes ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: { id: string }): Promise<OfferRow | null> => {
    return this.getOfferById(params.id);
  };

  createOffer = async (payload: OfferInput): Promise<OfferRow> => {
    const now = new Date();
    const insertData: NewHrmTbOffer = {
      candidateId: payload.candidateId,
      offerNumber: payload.offerNumber,
      positionTitle: payload.positionTitle,
      baseSalary: payload.baseSalary,
      currency: payload.currency ?? "VND",
      startDate: payload.startDate,
      employmentType: payload.employmentType ?? null,
      benefits: payload.benefits ?? null,
      terms: payload.terms ?? null,
      status: payload.status ?? "draft",
      expiryDate: payload.expiryDate ?? null,
      notes: payload.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create offer");

    const offer = await this.getOfferById(created.id);

    if (!offer) throw new Error("Failed to load offer after creation");

    return offer;
  };

  updateOffer = async (
    id: string,
    payload: Partial<OfferInput>,
  ): Promise<OfferRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.candidateId !== undefined)
      updateData.candidateId = payload.candidateId;
    if (payload.offerNumber !== undefined)
      updateData.offerNumber = payload.offerNumber;
    if (payload.positionTitle !== undefined)
      updateData.positionTitle = payload.positionTitle;
    if (payload.baseSalary !== undefined)
      updateData.baseSalary = payload.baseSalary;
    if (payload.currency !== undefined)
      updateData.currency = payload.currency ?? null;
    if (payload.startDate !== undefined)
      updateData.startDate = payload.startDate;
    if (payload.employmentType !== undefined)
      updateData.employmentType = payload.employmentType ?? null;
    if (payload.benefits !== undefined)
      updateData.benefits = payload.benefits ?? null;
    if (payload.terms !== undefined) updateData.terms = payload.terms ?? null;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.expiryDate !== undefined)
      updateData.expiryDate = payload.expiryDate ?? null;
    if (payload.notes !== undefined) updateData.notes = payload.notes ?? null;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getOfferById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<OfferInput> = {};

    if (payload.candidateId !== undefined) {
      normalizedPayload.candidateId = String(payload.candidateId);
    }
    if (payload.offerNumber !== undefined) {
      normalizedPayload.offerNumber = String(payload.offerNumber);
    }
    if (payload.positionTitle !== undefined) {
      normalizedPayload.positionTitle = this.normalizeLocaleInput(
        payload.positionTitle,
      ) ?? { en: "" };
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
    if (payload.startDate !== undefined) {
      normalizedPayload.startDate = String(payload.startDate);
    }
    if (payload.employmentType !== undefined) {
      normalizedPayload.employmentType =
        payload.employmentType === null || payload.employmentType === ""
          ? null
          : String(payload.employmentType);
    }
    if (payload.benefits !== undefined) {
      normalizedPayload.benefits = payload.benefits;
    }
    if (payload.terms !== undefined) {
      normalizedPayload.terms =
        payload.terms === null || payload.terms === ""
          ? null
          : String(payload.terms);
    }
    if (payload.status !== undefined) {
      normalizedPayload.status = String(payload.status);
    }
    if (payload.expiryDate !== undefined) {
      normalizedPayload.expiryDate =
        payload.expiryDate === null || payload.expiryDate === ""
          ? null
          : String(payload.expiryDate);
    }
    if (payload.notes !== undefined) {
      normalizedPayload.notes =
        payload.notes === null || payload.notes === ""
          ? null
          : String(payload.notes);
    }

    return this.updateOffer(id, normalizedPayload);
  };
}
