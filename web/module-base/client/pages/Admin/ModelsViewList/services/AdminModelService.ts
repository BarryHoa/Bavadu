import ClientHttpService from "@/module-base/client/services/ClientHttpService";

export type ModelRow = {
  key: string;
  module: string;
  path: string;
};

export type ModelListResponse = {
  success: boolean;
  data: ModelRow[];
  total: number;
  message?: string;
};

export type ReloadModelRequest = {
  key: string;
};

export type ReloadModelResponse = {
  success: boolean;
  message?: string;
};

class AdminModelService extends ClientHttpService {
  constructor() {
    super("/api/base/admin/model");
  }

  getModelList() {
    return this.get<ModelListResponse>("/get-model-list");
  }

  reloadModel(payload: ReloadModelRequest) {
    return this.post<ReloadModelResponse>("/reload-model", payload);
  }
}

const adminModelService = new AdminModelService();
export default adminModelService;
