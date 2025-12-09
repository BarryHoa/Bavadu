import type { LocaleDataType } from "@base/server/interfaces/Locale";
import type { User } from "@base/server/interfaces/User";
import type { TblSalesOrderB2B, TblSalesOrderLineB2B } from "@mdl/b2b-sales/server/schemas";

export type SalesOrderB2BStatus = "draft" | "sent" | "delivered" | "cancelled";

export interface SalesOrderB2BLine {
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
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface SalesOrderB2B extends Omit<TblSalesOrderB2B, "status"> {
  status: SalesOrderB2BStatus;
  lines?: SalesOrderB2BLine[];
  createdByUser?: User;
}

export interface CreateSalesOrderB2BInput {
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
  lines: Array<{
    productId: string;
    quantity: number;
    unitPrice?: number;
    description?: string;
    lineDiscount?: number;
    taxRate?: number;
  }>;
  totalDiscount?: number;
  totalTax?: number;
  shippingFee?: number;
  userId?: string;
}

export interface UpdateSalesOrderB2BInput extends Partial<CreateSalesOrderB2BInput> {
  id: string;
}

export interface DeliverSalesOrderB2BInput {
  orderId: string;
  warehouseId?: string;
  lines: Array<{
    lineId: string;
    quantity: number;
  }>;
  reference?: string;
  note?: string;
  userId?: string;
}

