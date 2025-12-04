import JsonRpcClientService from "@base/client/services/JsonRpcClientService";
import type { LocaleDataType } from "@base/server/interfaces/Locale";

import type { SelectItemOption } from "@base/client/components";
import type {
  ProductDetail,
  ProductFormPayload,
  ProductFormUpdatePayload,
} from "../interface/Product";

export type ProductTypeOption = {
  value: string;
  label: LocaleDataType<string>;
};

export type ProductFeatureOption = {
  key: string;
  label: LocaleDataType<string>;
};

export type ProductTypesResponse = {
  data: ProductTypeOption[];
};

export type ProductFeaturesResponse = {
  data: ProductFeatureOption[];
};

export type OptionalFieldDefinition = {
  field: string;
  type: "string" | "number" | "boolean" | "date" | "json" | "integer";
  label: LocaleDataType<string>;
  description?: LocaleDataType<string>;
  isRequired: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    maxLength?: number;
  };
};

export type OptionalFieldsResponse = {
  data: OptionalFieldDefinition[];
};

class ProductService extends JsonRpcClientService {
  constructor() {
    super("/api/base/internal/json-rpc");
  }

  async getProductList(params: any) {
    return this.call<{ data: any[] }>(
      "product.list.getData",
      params
    );
  }

  async getProductById(id: string) {
    return this.call<{ data: ProductDetail }>(
      "product.curd.getById",
      { id }
    );
  }

  async createProduct(payload: ProductFormPayload) {
    return this.call<{ data: ProductDetail }>(
      "product.curd.create",
      payload
    );
  }

  async updateProduct(id: string, payload: ProductFormUpdatePayload) {
    return this.call<{ data: ProductDetail }>(
      "product.curd.update",
      { id, ...payload }
    );
  }

  async getProductTypes() {
    return this.call<ProductTypesResponse>(
      "product.curd.getProductTypes",
      {}
    );
  }

  async getProductFeatures() {
    return this.call<ProductFeaturesResponse>(
      "product.curd.getProductFeatures",
      {}
    );
  }

  async getOptionalFieldsByProductType(type: string) {
    return this.call<OptionalFieldsResponse>(
      "product.curd.getOptionalFieldsByProductType",
      { type }
    );
  }
}

export default new ProductService();
