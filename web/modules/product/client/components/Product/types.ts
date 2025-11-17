import type { ProductMasterType, ProductMasterFeatures } from "../../interface/Product";

export type LocaleFieldValue = {
  en: string;
  vi: string;
};

export type VariantFieldValue = {
  name: LocaleFieldValue;
  description: string;
  sku: string;
  barcode: string;
  manufacturerName: string;
  manufacturerCode: string;
  baseUomId?: string;
  isActive: boolean;
  packings: Array<{
    id?: string;
    name: LocaleFieldValue;
    description: LocaleFieldValue;
    isActive: boolean;
  }>;
  attributes: Array<{
    id?: string;
    code: string;
    name: LocaleFieldValue;
    value: string;
  }>;
};

export type MasterFieldValue = {
  code: string;
  name: LocaleFieldValue;
  description: string;
  type: ProductMasterType;
  features: Record<ProductMasterFeatures, boolean>;
  isActive: boolean;
  brand: string;
  categoryId?: string;
};

export const updateLocaleValue = (
  value: LocaleFieldValue,
  locale: keyof LocaleFieldValue,
  next: string
): LocaleFieldValue => ({
  ...value,
  [locale]: next,
});
