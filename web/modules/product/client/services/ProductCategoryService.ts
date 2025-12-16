import type { ProductCategoryRow } from "../interface/ProductCategory";

import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export type ProductCategoryPayload = {
  code: string;
  name: string;
  description?: string;
  parentId?: string | null;
  level?: number | null;
  isActive?: boolean;
};

class ProductCategoryService extends JsonRpcClientService {
  async fetchTree(): Promise<ProductCategoryRow[]> {
    const response = await this.call<{
      success: boolean;
      data: ProductCategoryRow[];
    }>("product-category.list.getData", {});

    const data = response.data;

    return Array.isArray(data) ? data : [];
  }

  async getById(id: string): Promise<ProductCategoryRow> {
    const response = await this.call<{
      success: boolean;
      data: ProductCategoryRow;
    }>("product-category.curd.getById", { id });

    return response.data;
  }

  async createCategory(
    payload: ProductCategoryPayload,
  ): Promise<ProductCategoryRow> {
    const response = await this.call<{
      success: boolean;
      data: ProductCategoryRow;
    }>("product-category.curd.create", payload);

    return response.data;
  }

  async updateCategory(
    id: string,
    payload: ProductCategoryPayload,
  ): Promise<ProductCategoryRow> {
    const response = await this.call<{
      success: boolean;
      data: ProductCategoryRow;
    }>("product-category.curd.update", { id, ...payload });

    return response.data;
  }
}

export default new ProductCategoryService();
