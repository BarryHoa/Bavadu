import { ListParamsResponse } from "@base/server/models/interfaces/ListInterface";
import JsonRpcClientService from "./JsonRpcClientService";

type DataTableParams = {
  model: string;
  params: any;
};

/**
 * Convert model name from module.json to base model ID for list operations
 * Examples:
 * - "product.list" -> "product"
 * - "product-category.list" -> "product-category"
 * - "product" -> "product"
 */
function getBaseModelIdForList(modelId: string): string {
  if (modelId.endsWith(".list")) {
    return modelId.slice(0, -".list".length);
  }
  return modelId;
}

class ViewListDataTableService extends JsonRpcClientService {
  constructor() {
    super("/api/base/internal/json-rpc");
  }

  getData = async (req: DataTableParams) => {
    try {
      const baseModelId = getBaseModelIdForList(req.model);
      const response = await this.call<{ data: ListParamsResponse<any> }>(
        `${baseModelId}.list.getData`,
        req.params
      );
      return {
        data: response.data?.data,
        total: response.data?.total,
      };
    } catch (error) {
      console.error(error);
      return { data: [], total: 0 };
    }
  };

  getFilter = async (req: DataTableParams) => {
    const baseModelId = getBaseModelIdForList(req.model);
    return this.call<{ success: boolean; data: any[] }>(
      `${baseModelId}.list.getFilter`,
      req.params
    );
  };

  getFavoriteFilter = async (req: DataTableParams) => {
    const baseModelId = getBaseModelIdForList(req.model);
    return this.call<{ success: boolean; data: any[] }>(
      `${baseModelId}.list.getFavoriteFilter`,
      req.params
    );
  };

  getGroupBy = async (req: DataTableParams) => {
    const baseModelId = getBaseModelIdForList(req.model);
    return this.call<{ success: boolean; data: any[] }>(
      `${baseModelId}.list.getGroupBy`,
      req.params
    );
  };

  updateFavoriteFilter = async (req: DataTableParams) => {
    const baseModelId = getBaseModelIdForList(req.model);
    return this.call<{ success: boolean; data: any[] }>(
      `${baseModelId}.list.updateFavoriteFilter`,
      req.params
    );
  };
}

export default ViewListDataTableService;
