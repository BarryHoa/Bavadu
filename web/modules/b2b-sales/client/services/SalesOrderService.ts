import ClientHttpService from "@base/client/services/ClientHttpService";

export interface SalesOrderLineDto {
  id: string;
  productId: string;
  description?: string | null;
  quantityOrdered: string;
  quantityDelivered: string;
  unitPrice: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesOrderDto {
  id: string;
  code: string;
  customerName: string;
  status: string;
  warehouseId?: string | null;
  expectedDate?: string | null;
  totalAmount: string;
  currency?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default class SalesOrderService extends ClientHttpService {
  constructor() {
    super("/api/modules/b2b-sales/orders");
  }

  list() {
    return this.get<{
      data: SalesOrderDto[];
      message?: string;
    }>("/");
  }

  getById(id: string) {
    return this.get<{
      data: { order: SalesOrderDto; lines: SalesOrderLineDto[] };
      message?: string;
    }>(`/detail?id=${id}`);
  }

  create(payload: {
    customerName: string;
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
      data: { order: SalesOrderDto; lines: SalesOrderLineDto[] };
      message?: string;
    }>("/create", payload);
  }

  confirm(orderId: string) {
    return this.post<{
      data: SalesOrderDto;
      message?: string;
    }>("/confirm", { orderId });
  }

  deliver(payload: {
    orderId: string;
    warehouseId?: string;
    reference?: string;
    note?: string;
    userId?: string;
    lines: Array<{ lineId: string; quantity: number }>;
  }) {
    return this.post<{
      data: { order: SalesOrderDto; lines: SalesOrderLineDto[] };
      message?: string;
    }>("/deliver", payload);
  }
}

export const salesOrderService = new SalesOrderService();
