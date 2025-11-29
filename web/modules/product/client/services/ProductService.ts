import ClientHttpService from "@base/client/services/ClientHttpService";
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

class ProductService extends ClientHttpService {
  constructor() {
    const BASE_URL = "/api/modules/product";
    super(BASE_URL);
  }

  async getProductList(params: any) {
    // POST to fetch list of products
    return this.post<{ data: any[] }>(`/`, params);
  }

  async getProductById(id: string) {
    // GET to fetch product by ID
    return this.get<{ data: ProductDetail }>(`/${id}`);
  }

  async createProduct(payload: ProductFormPayload) {
    return this.post<{ data: ProductDetail }>(
      `/create`,
      payload
    );
  }

  async updateProduct(id: string, payload: ProductFormUpdatePayload) {
    return this.patch<{ data: ProductDetail }>(
      `/${id}`,
      payload
    );
  }

  async getProductTypes() {
    return this.get<ProductTypesResponse>(`/types`);
  }

  async getProductFeatures() {
    return this.get<ProductFeaturesResponse>(`/features`);
  }

  async getOptionalFieldsByProductType(type: string) {
    return this.get<OptionalFieldsResponse>(
      `/optional-fields?type=${encodeURIComponent(type)}`
    );
  }
}

export default new ProductService();
