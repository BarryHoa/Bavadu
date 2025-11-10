import ClientHttpService from "@base/client/services/ClientHttpService";

import type {
  ProductDetail,
  ProductFormPayload,
  ProductFormUpdatePayload,
} from "../interface/Product";

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
}

export default new ProductService();
