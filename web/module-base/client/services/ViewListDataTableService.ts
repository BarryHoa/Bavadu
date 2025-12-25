import { ListParamsResponse } from "@base/shared/interface/ListInterface";

import JsonRpcClientService from "./JsonRpcClientService";

type IBaseTableParams = {
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
  getData = async (req: IBaseTableParams) => {
    try {
      const baseModelId = this.getBaseModelIdForList(req.model);
      const response = await this.call<ListParamsResponse<any>>(
        `${baseModelId}.getData`,
        req.params,
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

  getFilter = async (req: IBaseTableParams) => {
    const baseModelId = this.getBaseModelIdForList(req.model);

    return this.call<{ success: boolean; data: any[] }>(
      `${baseModelId}.getFilter`,
      req.params,
    );
  };

  getFavoriteFilter = async (req: IBaseTableParams) => {
    const baseModelId = this.getBaseModelIdForList(req.model);

    return this.call<{ success: boolean; data: any[] }>(
      `${baseModelId}.getFavoriteFilter`,
      req.params,
    );
  };

  getGroupBy = async (req: IBaseTableParams) => {
    const baseModelId = this.getBaseModelIdForList(req.model);

    return this.call<{ success: boolean; data: any[] }>(
      `${baseModelId}.getGroupBy`,
      req.params,
    );
  };

  updateFavoriteFilter = async (req: IBaseTableParams) => {
    const baseModelId = this.getBaseModelIdForList(req.model);

    return this.call<{ success: boolean; data: any[] }>(
      `${baseModelId}.updateFavoriteFilter`,
      req.params,
    );
  };
}

export default ViewListDataTableService;
