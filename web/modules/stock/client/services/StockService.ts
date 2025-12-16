import { Address } from "@base/client/interface/Address";
import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface WarehouseDto {
  id: string;
  code: string;
  name: string;
  typeCode: string;
  status: string;
  companyId: string | null;
  managerId: string | null;
  contactId: string | null;
  address: Address[];
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
  address: Address[];
  valuationMethod?: string | null;
  minStock?: number | null;
  maxStock?: number | null;
  accountInventory?: string | null;
  accountAdjustment?: string | null;
  notes?: string | null;
}

export interface StockSummaryItem {
  productId: string;
  productCode: string;
  productName: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  minStock: number | null;
}

type ApiResponse<T> = {
  data?: T;
  message?: string;
};

class StockService extends JsonRpcClientService {
  listWarehouses() {
    return this.call<ApiResponse<WarehouseDto[]>>(
      "stock-warehouse.list.getData",
      {},
    );
  }

  createWarehouse(payload: WarehousePayload) {
    return this.call<ApiResponse<WarehouseDto>>(
      "stock-warehouse.curd.create",
      payload,
    );
  }

  getWarehouseById(id: string) {
    return this.call<ApiResponse<WarehouseDto>>(
      "stock-warehouse.curd.getById",
      { id },
    );
  }

  updateWarehouse(payload: WarehousePayload & { id: string }) {
    return this.call<ApiResponse<WarehouseDto>>(
      "stock-warehouse.curd.update",
      payload,
    );
  }

  getStockSummary(params?: { productId?: string; warehouseId?: string }) {
    return this.call<ApiResponse<StockSummaryItem[]>>(
      "stock-summary.list.getData",
      params || {},
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
    return this.call<ApiResponse<boolean>>("stock.curd.adjust", payload);
  }

  receiveStock(payload: {
    productId: string;
    warehouseId: string;
    quantity: number;
    reference?: string;
    note?: string;
    userId?: string;
  }) {
    return this.call<ApiResponse<boolean>>("stock.curd.inbound", payload);
  }

  issueStock(payload: {
    productId: string;
    warehouseId: string;
    quantity: number;
    reference?: string;
    note?: string;
    userId?: string;
  }) {
    return this.call<ApiResponse<boolean>>("stock.curd.outbound", payload);
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
    return this.call<ApiResponse<boolean>>("stock.curd.transfer", payload);
  }
}

export default new StockService();
