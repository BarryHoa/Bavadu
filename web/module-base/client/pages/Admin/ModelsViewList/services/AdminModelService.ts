import ClientHttpService from "@/module-base/client/services/ClientHttpService";

type ModelListResponse = {
  success: boolean;
  data: string[];
  message: string;
};

type ReloadModelRequest = {
  key: string;
};

type ReloadModelResponse = {
  success: boolean;
  message: string;
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