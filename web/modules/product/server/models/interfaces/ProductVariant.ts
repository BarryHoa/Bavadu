import { LocaleDataType } from "@base/shared/interface/Locale";
import { User } from "@base/server/interfaces/User";

import { MasterProductId } from "./ProductMaster";
import { UnitOfMeasure } from "./ProductUom";
import { ProductAttribute } from "./ProductAttribute";

export interface ProductVariant {
  id: string; // uuid v7
  productMasterId: MasterProductId;
  name: LocaleDataType<string>;
  description?: string;
  images?: { url: string; alt?: string }[];
  sku?: string;
  barcode?: string;
  manufacturer?: {
    name?: string;
    code?: string;
  };

  baseUom?: UnitOfMeasure; // Đơn vị chính (Base Unit)
  isActive: boolean;
  attributes?: ProductAttribute[];

  // Relation
  createdAt?: number; // unix timestamp (ms)
  updatedAt?: number; // unix timestamp (ms)
  createdBy?: User;
  updatedBy?: User;
}
