import { LocaleDataType } from "@base/server/interfaces/Locale";

export type ProductCategoryRow = {
  id: string;
  code: string;
  name?: LocaleDataType<string> | string;
  description?: LocaleDataType<string> | string;
  level?: number;
  isActive?: boolean;
  parent?: {
    id: string;
    name?: LocaleDataType<string> | string;
  } | null;
  createdAt?: number;
  updatedAt?: number;
};
