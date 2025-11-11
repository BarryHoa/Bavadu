import ClientHttpService from "@base/client/services/ClientHttpService";

export interface WarehouseDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockSummaryItem {
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
}

class StockService extends ClientHttpService {
  constructor() {
    super("/api/modules/stock");
  }

  listWarehouses() {
    return this.get<{ success: boolean; data: WarehouseDto[] }>(
      "/warehouses"
    );
  }

  createWarehouse(payload: {
    code: string;
    name: string;
    description?: string;
    isActive?: boolean;
  }) {
    return this.post<{ success: boolean; data: WarehouseDto }>(
      "/warehouses/create",
      payload
    );
  }

  getStockSummary(params?: { productId?: string; warehouseId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.productId) searchParams.set("productId", params.productId);
    if (params?.warehouseId) searchParams.set("warehouseId", params.warehouseId);
    const query = searchParams.toString();

    return this.get<{ success: boolean; data: StockSummaryItem[] }>(
      `/stock/summary${query ? `?${query}` : ""}`
    );
  }

  adjustStock(payload: {
    productId: string;
    warehouseId: string;
    quantityDelta: number;
    reference?: string;
    note?: string;
    userId?: string;
  }) {
    return this.post<{ success: boolean }>(
      "/movements/adjust",
      payload
    );
  }

  receiveStock(payload: {
    productId: string;
    warehouseId: string;
    quantity: number;
    reference?: string;
    note?: string;
    userId?: string;
  }) {
    return this.post<{ success: boolean }>(
      "/movements/inbound",
      payload
    );
  }

  issueStock(payload: {
    productId: string;
    warehouseId: string;
    quantity: number;
    reference?: string;
    note?: string;
    userId?: string;
  }) {
    return this.post<{ success: boolean }>(
      "/movements/outbound",
      payload
    );
  }

  transferStock(payload: {
    productId: string;
    sourceWarehouseId: string;
    targetWarehouseId: string;
    quantity: number;
    reference?: string;
    note?: string;
    userId?: string;
  }) {
    return this.post<{ success: boolean }>(
      "/movements/transfer",
      payload
    );
  }
}

export default new StockService();

