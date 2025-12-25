import type { LocaleDataType } from "@base/shared/interface/Locale";

export interface PerformanceReviewDto {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: LocaleDataType<string>;
  } | null;
  reviewType: string;
  reviewPeriod?: string | null;
  reviewDate: string;
  reviewerId: string;
  reviewer?: {
    id: string;
    employeeCode?: string;
    fullName?: LocaleDataType<string>;
  } | null;
  overallRating?: number | null;
  strengths?: string | null;
  areasForImprovement?: string | null;
  goals?: unknown;
  feedback?: string | null;
  employeeComments?: string | null;
  status: string;
  completedDate?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreatePerformanceReviewPayload {
  employeeId: string;
  reviewType: string;
  reviewPeriod?: string | null;
  reviewDate: string;
  reviewerId: string;
  overallRating?: number | null;
  strengths?: string | null;
  areasForImprovement?: string | null;
  goals?: unknown;
  feedback?: string | null;
  employeeComments?: string | null;
  status?: string;
}

export interface UpdatePerformanceReviewPayload extends Partial<CreatePerformanceReviewPayload> {
  id: string;
}
