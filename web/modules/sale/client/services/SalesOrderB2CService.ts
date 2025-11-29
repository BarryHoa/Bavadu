import ClientHttpService from "@base/client/services/ClientHttpService";

export interface SalesOrderB2CLineDto {
  id: string;
  productId: string;
  description?: string | null;
  quantityOrdered: string;
  quantityDelivered: string;
  unitPrice: string;
  lineDiscount: string;
  taxRate: string;
  lineTax: string;
  lineSubtotal: string;
  lineTotal: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesOrderB2CDto {
  id: string;
  code: string;
  status: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  deliveryAddress?: string | null;
  paymentMethodId?: string | null;
  shippingMethodId?: string | null;
  shippingTermsId?: string | null;
  requireInvoice: boolean;
  warehouseId?: string | null;
  expectedDate?: string | null;
  subtotal: string;
  totalDiscount: string;
  totalTax: string;
  shippingFee: string;
  grandTotal: string;
  totalAmount: string;
  currency?: string | null;
  currencyRate?: string | null;
  completedAt?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
}

export default class SalesOrderB2CService extends ClientHttpService {
  constructor() {
    super("/api/modules/sale/orders-b2c");
  }

  list() {
    return this.get<{
      data: SalesOrderB2CDto[];
      message?: string;
    }>("/");
  }

  getById(id: string) {
    return this.get<{
      data: { order: SalesOrderB2CDto; lines: SalesOrderB2CLineDto[] };
      message?: string;
    }>(`/detail?id=${id}`);
  }

  create(payload: {
    code?: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    deliveryAddress?: string;
    paymentMethodId?: string;
    shippingMethodId?: string;
    shippingTermsId?: string;
    requireInvoice?: boolean;
    warehouseId?: string;
    expectedDate?: string;
    currency?: string;
    notes?: string;
    totalDiscount?: number;
    totalTax?: number;
    shippingFee?: number;
    userId?: string;
    lines: Array<{
      productId: string;
      quantity: number;
      unitPrice?: number;
      description?: string;
      lineDiscount?: number;
      taxRate?: number;
    }>;
  }) {
    return this.post<{
      data: { order: SalesOrderB2CDto; lines: SalesOrderB2CLineDto[] };
      message?: string;
    }>("/create", payload);
  }

  update(payload: {
    id: string;
    code?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    deliveryAddress?: string;
    paymentMethodId?: string;
    shippingMethodId?: string;
    shippingTermsId?: string;
    requireInvoice?: boolean;
    warehouseId?: string;
    expectedDate?: string;
    currency?: string;
    notes?: string;
    totalDiscount?: number;
    totalTax?: number;
    shippingFee?: number;
    userId?: string;
    lines: Array<{
      productId: string;
      quantity: number;
      unitPrice?: number;
      description?: string;
      lineDiscount?: number;
      taxRate?: number;
    }>;
  }) {
    return this.put<{
      data: { order: SalesOrderB2CDto; lines: SalesOrderB2CLineDto[] };
      message?: string;
    }>("/update", payload);
  }

  confirm(orderId: string) {
    return this.post<{
      data: SalesOrderB2CDto;
      message?: string;
    }>("/confirm", { orderId });
  }

  complete(orderId: string) {
    return this.post<{
      data: SalesOrderB2CDto;
      message?: string;
    }>("/complete", { orderId });
  }
}

export const salesOrderB2CService = new SalesOrderB2CService();

