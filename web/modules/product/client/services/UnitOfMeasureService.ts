import ClientHttpService from "@base/client/services/ClientHttpService";

export type UnitOfMeasureOption = {
  id: string;
  name: unknown;
  symbol?: string;
  isActive?: boolean;
};

class UnitOfMeasureService extends ClientHttpService {
  constructor() {
    super("/api/modules/product/uom");
  }

  async getList() {
    return this.get<{ success: boolean; data: UnitOfMeasureOption[] }>("/");
  }
}

export default new UnitOfMeasureService();
