import { LocaleDataType } from "@base/server/interfaces/Locale";

export type ProductRow = {
  id: string;
  name?: LocaleDataType<string> | string;
  description?: LocaleDataType<string> | string;
  sku?: string;
  barcode?: string;
  manufacturer?: {
    name?: LocaleDataType<string> | string;
    code?: string;
  };
  images?: { url: string; alt?: string }[];
  isActive?: boolean;
  productMaster?: {
    id: string;
    name?: LocaleDataType<string> | string;
    brand?: LocaleDataType<string> | string;
    category?: {
      id: string;
      code?: string;
      name?: LocaleDataType<string> | string;
    };
  };
  baseUom?: {
    id: string;
    name?: LocaleDataType<string> | string;
  };

  createdAt?: number;
  updatedAt?: number;
};
