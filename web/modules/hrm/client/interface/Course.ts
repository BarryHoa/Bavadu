import type { LocaleDataType } from "@base/shared/interface/Locale";

export interface CourseDto {
  id: string;
  code: string;
  name?: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  category?: string | null;
  duration?: number | null;
  format?: string | null;
  instructor?: string | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateCoursePayload {
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  category?: string | null;
  duration?: number | null;
  format?: string | null;
  instructor?: string | null;
  isActive?: boolean;
}

export interface UpdateCoursePayload extends Partial<CreateCoursePayload> {
  id: string;
}
