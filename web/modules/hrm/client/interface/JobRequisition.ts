import type { LocaleDataType } from "@base/server/interfaces/Locale";

export interface JobRequisitionDto {
  id: string;
  requisitionNumber: string;
  title?: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  departmentId: string;
  department?: {
    id: string;
    name?: LocaleDataType<string>;
  } | null;
  positionId: string;
  position?: {
    id: string;
    name?: LocaleDataType<string>;
  } | null;
  numberOfOpenings: number;
  priority?: string | null;
  employmentType?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  requirements?: string | null;
  status: string;
  openedDate?: string | null;
  closedDate?: string | null;
  hiringManagerId?: string | null;
  recruiterId?: string | null;
  notes?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateJobRequisitionPayload {
  requisitionNumber: string;
  title: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  departmentId: string;
  positionId: string;
  numberOfOpenings?: number;
  priority?: string | null;
  employmentType?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  currency?: string | null;
  requirements?: string | null;
  status?: string;
  openedDate?: string | null;
  closedDate?: string | null;
  hiringManagerId?: string | null;
  recruiterId?: string | null;
  notes?: string | null;
}

export interface UpdateJobRequisitionPayload extends Partial<CreateJobRequisitionPayload> {
  id: string;
}
