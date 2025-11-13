import ClientHttpService from "@base/client/services/ClientHttpService";

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

export default class PurchaseOrderService extends ClientHttpService {
  constructor() {
    super("/api/modules/purchase/orders");
  }

  list() {
    return this.get<{
      success: boolean;
      data: PurchaseOrderDto[];
      message?: string;
    }>("/");
  }

  getById(id: string) {
    return this.get<{
      success: boolean;
      data: { order: PurchaseOrderDto; lines: PurchaseOrderLineDto[] };
      message?: string;
    }>(`/detail?id=${id}`);
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
    return this.post<{
      success: boolean;
      data: { order: PurchaseOrderDto; lines: PurchaseOrderLineDto[] };
      message?: string;
    }>("/create", payload);
  }

  confirm(orderId: string) {
    return this.post<{
      success: boolean;
      data: PurchaseOrderDto;
      message?: string;
    }>("/confirm", { orderId });
  }

  receive(payload: {
    orderId: string;
    warehouseId?: string;
    reference?: string;
    note?: string;
    userId?: string;
    lines: Array<{ lineId: string; quantity: number }>;
  }) {
    return this.post<{
      success: boolean;
      data: { order: PurchaseOrderDto; lines: PurchaseOrderLineDto[] };
      message?: string;
    }>("/receive", payload);
  }
}

export const purchaseOrderService = new PurchaseOrderService();

