import { ListParamsResponse } from "@base/server/models/interfaces/ListInterface";
import ClientHttpService from "./ClientHttpService";

type DataTableParams = {
  modelId: string;
  params: any;
};

class ViewListDataTableService extends ClientHttpService {
  constructor() {
    super("/api/base/view-list-data-table");
  }

  getData = async (req: DataTableParams) => {
    try {
      const response = await this.post<{ data: ListParamsResponse<any> }>(
        `/data`,
        req
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
    return this.post<{ success: boolean; data: any[] }>(`/filter`, req);
  };

  getFavoriteFilter = async (req: DataTableParams) => {
    return this.post<{ success: boolean; data: any[] }>(
      `/favorite-filter`,
      req
    );
  };

  getGroupBy = async (req: DataTableParams) => {
    return this.post<{ success: boolean; data: any[] }>(`/group-by`, req);
  };

  updateFavoriteFilter = async (req: DataTableParams) => {
    return this.post<{ success: boolean; data: any[] }>(
      `/favorite-filter-update`,
      req
    );
  };
}

export default ViewListDataTableService;
