import type { LocaleDataType } from "@base/server/interfaces/Locale";

export interface CertificateDto {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: LocaleDataType<string>;
  } | null;
  name?: LocaleDataType<string>;
  issuer: string;
  certificateNumber?: string | null;
  issueDate: string;
  expiryDate?: string | null;
  documentUrl?: string | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateCertificatePayload {
  employeeId: string;
  name: LocaleDataType<string>;
  issuer: string;
  certificateNumber?: string | null;
  issueDate: string;
  expiryDate?: string | null;
  documentUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateCertificatePayload extends Partial<CreateCertificatePayload> {
  id: string;
}

