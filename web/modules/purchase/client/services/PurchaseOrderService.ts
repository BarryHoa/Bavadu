import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface PurchaseOrderLineDto {
  id: string;
  productId: string;
  description?: string | null;
  quantityOrdered: string;
  quantityReceived: string;
  unitPrice: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderDto {
  id: string;
  code: string;
  vendorName: string;
  status: string;
  warehouseId?: string | null;
  expectedDate?: string | null;
  totalAmount: string;
  currency?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default class PurchaseOrderService extends JsonRpcClientService {
  constructor() {
    super("/api/base/internal/json-rpc");
  }

  list() {
    return this.call<{
      data: PurchaseOrderDto[];
      message?: string;
    }>("purchase-order.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: { order: PurchaseOrderDto; lines: PurchaseOrderLineDto[] };
      message?: string;
    }>("purchase-order.curd.getById", { id });
  }

  create(payload: {
    vendorName: string;
    warehouseId?: string;
    expectedDate?: string;
    currency?: string;
    notes?: string;
    userId?: string;
    lines: Array<{
      productId: string;
      quantity: number;
      unitPrice?: number;
      description?: string;
    }>;
  }) {
    return this.call<{
      data: { order: PurchaseOrderDto; lines: PurchaseOrderLineDto[] };
      message?: string;
    }>("purchase-order.curd.create", payload);
  }

  confirm(orderId: string) {
    return this.call<{
      data: PurchaseOrderDto;
      message?: string;
    }>("purchase-order.curd.confirm", { orderId });
  }

  receive(payload: {
    orderId: string;
    warehouseId?: string;
    reference?: string;
    note?: string;
    userId?: string;
    lines: Array<{ lineId: string; quantity: number }>;
  }) {
    return this.call<{
      data: { order: PurchaseOrderDto; lines: PurchaseOrderLineDto[] };
      message?: string;
    }>("purchase-order.curd.receive", payload);
  }
}

export const purchaseOrderService = new PurchaseOrderService();

