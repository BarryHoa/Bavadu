import { ParamFilter } from "@base/server";
import { LocaleDataType } from "@base/server/interfaces/Locale";
import { ProductVariant } from "../interfaces/ProductVariant";
import {
  MasterProduct,
  ProductMasterEnum,
  ProductMasterFeatures,
} from "../interfaces/ProductMaster";
import { ProductPacking } from "../interfaces/ProductPacking";
import { ProductAttribute } from "../interfaces/ProductAttribute";

export interface ProductFilter extends ParamFilter {
  productMasterId?: string;
  name?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  manufacturer?: string;
}
export interface ProductVariantElm extends ProductVariant {}

export type LocaleInput = string | LocaleDataType<string> | null | undefined;

export interface ProductMasterInput {
  id?: string;
  code: string;
  name: LocaleInput;
  description?: string | null;
  type: ProductMasterEnum;
  features?: Partial<ProductMasterFeatures> | null;
  isActive?: boolean;
  brand?: string | null;
  categoryId?: string | null;
}

export interface ProductVariantInput {
  id?: string;
  name: LocaleInput;
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
}

export interface ProductPackingInput {
  id?: string;
  name: LocaleInput;
  description?: LocaleInput;
  isActive?: boolean;
}

export interface ProductAttributeInput {
  id?: string;
  code: string;
  name: LocaleInput;
  value: string;
}

export interface ProductCreateInput {
  master: ProductMasterInput;
  variant: ProductVariantInput;
  packings?: ProductPackingInput[];
  attributes?: ProductAttributeInput[];
}

export interface ProductUpdateInput extends ProductCreateInput {
  id: string;
}

export interface ProductDetail {
  variant: ProductVariant;
  master: MasterProduct;
  packings: ProductPacking[];
  attributes: ProductAttribute[];
}
