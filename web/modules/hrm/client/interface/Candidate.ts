import type { LocaleDataType } from "@base/server/interfaces/Locale";

export interface CandidateDto {
  id: string;
  requisitionId: string;
  requisition?: {
    id: string;
    requisitionNumber?: string;
    title?: LocaleDataType<string>;
  } | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: LocaleDataType<string>;
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

export interface CreateCandidatePayload {
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

export interface UpdateCandidatePayload extends Partial<CreateCandidatePayload> {
  id: string;
}
