import type { ImageUploadItem } from "@/module-base/client/interface/ImageUpload";
import type {
  ProductMasterFeatures,
  ProductMasterFeaturesType,
  ProductMasterType,
} from "../../../interface/Product";

export type LocaleFieldValue = {
  en: string;
  vi: string;
};

export type UomConversions = {
  uomId: string | null;
  uomName: string | null;
  label: string;
  type: ProductMasterFeaturesType | "other";
  conversionRatio: number | null;
  uuid: string;
  isActive: boolean;
};

export type VariantFieldValue = {
  name: LocaleFieldValue;
  description: string;
  sku: string;
  barcode: string;
  manufacturerName: string;
  manufacturerCode: string;
  baseUom?: { id: string; name: string };
  saleUom?: { id: string; name: string };
  purchaseUom?: { id: string; name: string };
  manufacturingUom?: { id: string; name: string };
  uomConversions: UomConversions[];
  isActive: boolean;
  images: ImageUploadItem[];
  packings: Array<{
    id?: string;
    name: LocaleFieldValue;
    description: string;
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
  images: ImageUploadItem[];
};

export const updateLocaleValue = (
  value: LocaleFieldValue,
  locale: keyof LocaleFieldValue,
  next: string
): LocaleFieldValue => ({
  ...value,
  [locale]: next,
});
