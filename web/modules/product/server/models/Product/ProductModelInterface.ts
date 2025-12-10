import { ParamFilter } from "@base/server";
import { LocaleDataType } from "@base/server/interfaces/Locale";
import { ProductAttribute } from "../interfaces/ProductAttribute";
import {
  MasterProduct,
  ProductMasterEnum,
  ProductMasterFeatures,
} from "../interfaces/ProductMaster";
import { ProductPacking } from "../interfaces/ProductPacking";
import { ProductVariant } from "../interfaces/ProductVariant";

export interface ProductFilter extends ParamFilter {
  productMasterId?: string;
  name?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  manufacturer?: string;
  isActive?: boolean;
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
  images?: Array<{ id?: string; url?: string }>;
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
  saleUomId?: string | null;
  purchaseUomId?: string | null;
  manufacturingUomId?: string | null;
  isActive?: boolean;
  images?: { url: string; alt?: string | null }[];
}

export interface ProductPackingInput {
  id?: string;
  name: LocaleInput;
  description?: string | null;
  isActive?: boolean;
}

export interface ProductAttributeInput {
  id?: string;
  code: string;
  name: LocaleInput;
  value: string;
}

export interface UomConversionInput {
  uomId: string;
  uomName: string;
  conversionRatio: number;
  label?: string;
  type?: string;
}

export interface ProductCreateInput {
  master: ProductMasterInput;
  variant: ProductVariantInput;
  packings?: ProductPackingInput[];
  attributes?: ProductAttributeInput[];
  uomConversions?: UomConversionInput[];
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
