import ClientHttpService from "@base/client/services/ClientHttpService";

import type { ProductCategoryRow } from "../interface/ProductCategory";

export type ProductCategoryPayload = {
  code: string;
  name: string;
  description?: string;
  parentId?: string | null;
  level?: number | null;
  isActive?: boolean;
};

class ProductCategoryService extends ClientHttpService {
  constructor() {
    super("/api/modules/product/categories");
  }

  async fetchTree(): Promise<ProductCategoryRow[]> {
    const response = await this.get<{
      success: boolean;
      data: ProductCategoryRow[];
    }>("/get-list");

    return response.data ?? [];
  }

  async getById(id: string): Promise<ProductCategoryRow> {
    const response = await this.get<{
      success: boolean;
      data: ProductCategoryRow;
    }>(`/${id}`);

    return response.data;
  }

  async createCategory(
    payload: ProductCategoryPayload
  ): Promise<ProductCategoryRow> {
    const response = await this.post<{
      success: boolean;
      data: ProductCategoryRow;
    }>("", payload);

    return response.data;
  }

  async updateCategory(
    id: string,
    payload: ProductCategoryPayload
  ): Promise<ProductCategoryRow> {
    const response = await this.patch<{
      success: boolean;
      data: ProductCategoryRow;
    }>(`/${id}`, payload);

    return response.data;
  }
}

export default new ProductCategoryService();
