import { LocaleDataType } from "@base/server/interfaces/Locale";

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
}

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
