import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export type UnitOfMeasureOption = {
  id: string;
  name: unknown;
  symbol?: string;
  isActive?: boolean;
};

class UnitOfMeasureService extends JsonRpcClientService {
  async getList() {
    return this.call<{ success: boolean; data: UnitOfMeasureOption[] }>(
      "product.curd.getUomList",
      {},
    );
  }
}

export default new UnitOfMeasureService();
