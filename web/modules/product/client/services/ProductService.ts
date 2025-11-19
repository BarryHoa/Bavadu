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
  success: boolean;
  data: ProductTypeOption[];
};

export type ProductFeaturesResponse = {
  success: boolean;
  data: ProductFeatureOption[];
};

class ProductService extends ClientHttpService {
  constructor() {
    const BASE_URL = "/api/modules/product";
    super(BASE_URL);
  }

  async getProductList(params: any) {
    // POST to fetch list of products
    return this.post<{ success: boolean; data: any[] }>(`/`, params);
  }

  async getProductById(id: string) {
    // GET to fetch product by ID
    return this.get<{ success: boolean; data: ProductDetail }>(`/${id}`);
  }

  async createProduct(payload: ProductFormPayload) {
    return this.post<{ success: boolean; data: ProductDetail }>(
      `/create`,
      payload
    );
  }

  async updateProduct(id: string, payload: ProductFormUpdatePayload) {
    return this.patch<{ success: boolean; data: ProductDetail }>(
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
}

export default new ProductService();
