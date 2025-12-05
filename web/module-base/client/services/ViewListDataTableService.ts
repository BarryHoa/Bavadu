import { ListParamsResponse } from "@base/server/models/interfaces/ListInterface";
import JsonRpcClientService from "./JsonRpcClientService";

type DataTableParams = {
  model: string;
  params: any;
};

class ViewListDataTableService extends JsonRpcClientService {
  getBaseModelIdForList = (modelId: string): string => {
    if (modelId.endsWith(".list")) {
      return modelId;
    }
    return `${modelId}.list`;
  };
  getData = async (req: DataTableParams) => {
    try {
      const baseModelId = this.getBaseModelIdForList(req.model);
      const response = await this.call<ListParamsResponse<any>>(
        `${baseModelId}.getData`,
        req.params
      );
      return {
        data: response?.data,
        total: response?.total,
      };
    } catch (error) {
      console.error(error);
      return { data: [], total: 0 };
    }
  };

  getFilter = async (req: DataTableParams) => {
    const baseModelId = this.getBaseModelIdForList(req.model);
    return this.call<{ success: boolean; data: any[] }>(
      `${baseModelId}.getFilter`,
      req.params
    );
  };

  getFavoriteFilter = async (req: DataTableParams) => {
    const baseModelId = this.getBaseModelIdForList(req.model);
    return this.call<{ success: boolean; data: any[] }>(
      `${baseModelId}.getFavoriteFilter`,
      req.params
    );
  };

  getGroupBy = async (req: DataTableParams) => {
    const baseModelId = this.getBaseModelIdForList(req.model);
    return this.call<{ success: boolean; data: any[] }>(
      `${baseModelId}.getGroupBy`,
      req.params
    );
  };

  updateFavoriteFilter = async (req: DataTableParams) => {
    const baseModelId = this.getBaseModelIdForList(req.model);
    return this.call<{ success: boolean; data: any[] }>(
      `${baseModelId}.updateFavoriteFilter`,
      req.params
    );
  };
}

export default ViewListDataTableService;
