import { LocaleDataType } from "@base/server/interfaces/Locale";

export type LocaleFormValue = {
  en?: string;
  vi?: string;
};

export enum ProductMasterType {
  GOODS = "goods",
  SERVICE = "service",
  FINISHED_GOOD = "finished_good",
  RAW_MATERIAL = "raw_material",
  CONSUMABLE = "consumable",
  ASSET = "asset",
  TOOL = "tool",
}
export enum ProductMasterFeatures {
  SALE = "sale",
  PURCHASE = "purchase",
  MANUFACTURE = "manufacture",
  SUBCONTRACT = "subcontract",
  STOCKABLE = "stockable",
  MAINTENANCE = "maintenance",
  ASSET = "asset",
  ACCOUNTING = "accounting",
}

export type ProductRow = {
  id: string;
  productMasterId?: string;
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
    features?: Record<ProductMasterFeatures, boolean>;
    type?: ProductMasterType;
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

export type ProductPackingRow = {
  id?: string;
  name: LocaleDataType<string> | string;
  description?: LocaleDataType<string> | string;
  isActive?: boolean;
};

export type ProductAttributeRow = {
  id?: string;
  code: string;
  name: LocaleDataType<string> | string;
  value: string;
};

export type ProductDetail = {
  master: {
    id: string;
    code: string;
    name: LocaleDataType<string> | string;
    description?: LocaleDataType<string> | string;
    type?: ProductMasterType;
    features?: Record<string, boolean> | null;
    isActive?: boolean;
    brand?: LocaleDataType<string> | string;
    category?: {
      id: string;
      code?: string;
      name?: LocaleDataType<string> | string;
    };
  };
  variant: ProductRow & { productMasterId: string };
  packings: ProductPackingRow[];
  attributes: ProductAttributeRow[];
};

export type ProductFormPacking = {
  id?: string;
  name: LocaleFormValue;
  description?: LocaleFormValue;
  isActive: boolean;
};

export type ProductFormAttribute = {
  id?: string;
  code: string;
  name: LocaleFormValue;
  value: string;
};

export type ProductFormValues = {
  master: {
    code: string;
    name: LocaleFormValue;
    description: LocaleFormValue;
    type: ProductMasterType | "";
    features: Record<ProductMasterFeatures, boolean>;
    isActive: boolean;
    brand: LocaleFormValue;
    categoryId?: string;
  };
  variant: {
    name: LocaleFormValue;
    description: LocaleFormValue;
    sku: string;
    barcode: string;
    manufacturerName: LocaleFormValue;
    manufacturerCode: string;
    baseUomId?: string;
    isActive: boolean;
  };
  packings: ProductFormPacking[];
  attributes: ProductFormAttribute[];
};

export type ProductFormPayload = {
  master: {
    code: string;
    name: LocaleDataType<string>;
    description?: LocaleDataType<string> | null;
    type: ProductMasterType;
    features?: Partial<Record<ProductMasterFeatures, boolean>> | null;
    isActive?: boolean;
    brand?: LocaleDataType<string> | null;
    categoryId?: string | null;
  };
  variant: {
    name: LocaleDataType<string>;
    description?: LocaleDataType<string> | null;
    sku?: string | null;
    barcode?: string | null;
    manufacturer?: {
      name?: LocaleDataType<string> | null;
      code?: string | null;
    } | null;
    baseUomId?: string | null;
    isActive?: boolean;
    images?: { url: string; alt?: string | null }[];
  };
  packings?: Array<{
    id?: string;
    name: LocaleDataType<string>;
    description?: LocaleDataType<string> | null;
    isActive?: boolean;
  }>;
  attributes?: Array<{
    id?: string;
    code: string;
    name: LocaleDataType<string>;
    value: string;
  }>;
};

export type ProductFormUpdatePayload = ProductFormPayload;
