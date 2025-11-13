import ClientHttpService from "@base/client/services/ClientHttpService";

export interface WarehouseAddressDto {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
}

export interface WarehouseDto {
  id: string;
  code: string;
  name: string;
  typeCode: string;
  status: string;
  companyId: string | null;
  managerId: string | null;
  contactId: string | null;
  address: WarehouseAddressDto;
  valuationMethod: string;
  minStock: number;
  maxStock: number | null;
  accountInventory: string | null;
  accountAdjustment: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface WarehousePayload {
  id?: string;
  code: string;
  name: string;
  typeCode: string;
  status?: string | null;
  companyId?: string | null;
  managerId?: string | null;
  contactId?: string | null;
  address: WarehouseAddressDto;
  valuationMethod?: string | null;
  minStock?: number | null;
  maxStock?: number | null;
  accountInventory?: string | null;
  accountAdjustment?: string | null;
  notes?: string | null;
}

export interface StockSummaryItem {
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
}

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

class StockService extends ClientHttpService {
  constructor() {
    super("/api/modules/stock");
  }

  listWarehouses() {
    return this.get<ApiResponse<WarehouseDto[]>>("/warehouses");
  }

  createWarehouse(payload: WarehousePayload) {
    return this.post<ApiResponse<WarehouseDto>>("/warehouses/create", payload);
  }

  getWarehouseById(id: string) {
    const searchParams = new URLSearchParams({ id });
    return this.get<ApiResponse<WarehouseDto>>(
      `/warehouses/detail?${searchParams.toString()}`
    );
  }

  updateWarehouse(payload: WarehousePayload & { id: string }) {
    return this.put<ApiResponse<WarehouseDto>>("/warehouses/update", payload);
  }

  getStockSummary(params?: { productId?: string; warehouseId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.productId) searchParams.set("productId", params.productId);
    if (params?.warehouseId)
      searchParams.set("warehouseId", params.warehouseId);
    const query = searchParams.toString();

    return this.get<ApiResponse<StockSummaryItem[]>>(
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
    return this.post<ApiResponse<boolean>>("/movements/adjust", payload);
  }

  receiveStock(payload: {
    productId: string;
    warehouseId: string;
    quantity: number;
    reference?: string;
    note?: string;
    userId?: string;
  }) {
    return this.post<ApiResponse<boolean>>("/movements/inbound", payload);
  }

  issueStock(payload: {
    productId: string;
    warehouseId: string;
    quantity: number;
    reference?: string;
    note?: string;
    userId?: string;
  }) {
    return this.post<ApiResponse<boolean>>("/movements/outbound", payload);
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
    return this.post<ApiResponse<boolean>>("/movements/transfer", payload);
  }
}

export default new StockService();
