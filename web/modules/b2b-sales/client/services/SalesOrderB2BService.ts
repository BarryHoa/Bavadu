import ClientHttpService from "@base/client/services/ClientHttpService";

export interface SalesOrderB2BLineDto {
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

export interface SalesOrderB2BDto {
  id: string;
  code: string;
  status: string;
  companyName: string;
  taxId?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  companyAddress?: string | null;
  paymentTermsId?: string | null;
  creditLimit?: string | null;
  invoiceRequired: boolean;
  shippingMethodId?: string | null;
  shippingTermsId?: string | null;
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
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
}

export default class SalesOrderB2BService extends ClientHttpService {
  constructor() {
    super("/api/modules/b2b-sales/orders-b2b");
  }

  list() {
    return this.get<{
      data: SalesOrderB2BDto[];
      message?: string;
    }>("/");
  }

  getById(id: string) {
    return this.get<{
      data: { order: SalesOrderB2BDto; lines: SalesOrderB2BLineDto[] };
      message?: string;
    }>(`/detail?id=${id}`);
  }

  create(payload: {
    code?: string;
    companyName: string;
    taxId?: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    companyAddress?: string;
    paymentTermsId?: string;
    creditLimit?: number;
    invoiceRequired?: boolean;
    shippingMethodId?: string;
    shippingTermsId?: string;
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
      data: { order: SalesOrderB2BDto; lines: SalesOrderB2BLineDto[] };
      message?: string;
    }>("/create", payload);
  }

  update(payload: {
    id: string;
    code?: string;
    companyName?: string;
    taxId?: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    companyAddress?: string;
    paymentTermsId?: string;
    creditLimit?: number;
    invoiceRequired?: boolean;
    shippingMethodId?: string;
    shippingTermsId?: string;
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
      data: { order: SalesOrderB2BDto; lines: SalesOrderB2BLineDto[] };
      message?: string;
    }>("/update", payload);
  }

  send(orderId: string) {
    return this.post<{
      data: SalesOrderB2BDto;
      message?: string;
    }>("/send", { orderId });
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
      data: { order: SalesOrderB2BDto; lines: SalesOrderB2BLineDto[] };
      message?: string;
    }>("/deliver", payload);
  }
}

export const salesOrderB2BService = new SalesOrderB2BService();

