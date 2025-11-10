import { ParamFilter } from "@base/server";
import { ProductVariant } from "../interfaces/ProductVariant";

export interface ProductFilter extends ParamFilter {
  productMasterId?: string;
  name?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  manufacturer?: string;
}
export interface ProductVariantElm extends ProductVariant {}
