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
export type ProductMasterFeaturesType = `${ProductMasterFeatures}`;

export type ProductRow = {
  id: string;
  productMasterId?: string;
  name?: LocaleDataType<string> | string;
  description?: string;
  sku?: string;
  barcode?: string;
  manufacturer?: {
    name?: string;
    code?: string;
  };
  images?: { url: string; alt?: string }[];
  isActive?: boolean;
  productMaster?: {
    id: string;
    name?: LocaleDataType<string> | string;
    brand?: string;
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
    description?: string;
    type?: ProductMasterType;
    features?: Record<string, boolean> | null;
    isActive?: boolean;
    brand?: string;
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
  description?: string;
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
    description: string;
    type: ProductMasterType | "";
    features: Record<ProductMasterFeatures, boolean>;
    isActive: boolean;
    brand: string;
    categoryId?: string;
  };
  variants: Array<{
    name: LocaleFormValue;
    description: string;
    sku: string;
    barcode: string;
    manufacturerName: string;
    manufacturerCode: string;
    baseUomId?: string;
    saleUomId?: string;
    purchaseUomId?: string;
    manufacturingUomId?: string;
    uomConversions?: Array<{
      uuid: string;
      uomId: string | null;
      uomName: string | null;
      label: string;
      type: string;
      isActive: boolean;
      conversionRatio: number | null;
    }>;
    isActive: boolean;
    packings: ProductFormPacking[];
    attributes: ProductFormAttribute[];
  }>;
};

export type ProductFormPayload = {
  master: {
    code: string;
    name: LocaleDataType<string>;
    description?: string | null;
    type: ProductMasterType;
    features?: Partial<Record<ProductMasterFeatures, boolean>> | null;
    isActive?: boolean;
    brand?: string | null;
    categoryId?: string | null;
  };
  variant: {
    name: LocaleDataType<string>;
    description?: string | null;
    sku?: string | null;
    barcode?: string | null;
    manufacturer?: {
      name?: string | null;
      code?: string | null;
    } | null;
    baseUomId?: string | null;
    isActive?: boolean;
    images?: { url: string; alt?: string | null }[];
  };
  packings?: Array<{
    id?: string;
    name: LocaleDataType<string>;
    description?: string | null;
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
