import {
  ListParamsRequest,
  ListParamsResponse,
  ParamFilter,
} from "@base/server";
import { MasterProduct } from "../interfaces/ProductMaster";
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

export interface ProductModelInterface {
  getProducts(
    filter: ListParamsRequest<ProductFilter>
  ): Promise<ListParamsResponse<ProductVariantElm>>;
  getProductById(id: string): Promise<MasterProduct | null>;
}
