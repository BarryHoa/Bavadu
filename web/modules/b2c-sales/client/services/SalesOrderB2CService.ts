import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

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

export default class SalesOrderB2CService extends JsonRpcClientService {
  constructor() {
    super("/api/base/internal/json-rpc");
  }

  list() {
    return this.call<{
      data: SalesOrderB2CDto[];
      message?: string;
    }>("b2c-sales-order.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: { order: SalesOrderB2CDto; lines: SalesOrderB2CLineDto[] };
      message?: string;
    }>("b2c-sales-order.curd.getById", { id });
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
    priceListId?: string;
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
    return this.call<{
      data: { order: SalesOrderB2CDto; lines: SalesOrderB2CLineDto[] };
      message?: string;
    }>("b2c-sales-order.curd.create", payload);
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
    return this.call<{
      data: { order: SalesOrderB2CDto; lines: SalesOrderB2CLineDto[] };
      message?: string;
    }>("b2c-sales-order.curd.update", payload);
  }

  confirm(orderId: string) {
    return this.call<{
      data: SalesOrderB2CDto;
      message?: string;
    }>("b2c-sales-order.curd.confirm", { orderId });
  }

  complete(orderId: string) {
    return this.call<{
      data: SalesOrderB2CDto;
      message?: string;
    }>("b2c-sales-order.curd.complete", { orderId });
  }
}

export const salesOrderB2CService = new SalesOrderB2CService();
