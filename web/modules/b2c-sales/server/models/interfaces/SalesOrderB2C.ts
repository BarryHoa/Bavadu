import type { User } from "@base/server/interfaces/User";
import type { TblSalesOrderB2C } from "../../schemas";

export type SalesOrderB2CStatus =
  | "draft"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface SalesOrderB2CLine {
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

export interface SalesOrderB2C extends Omit<TblSalesOrderB2C, "status"> {
  status: SalesOrderB2CStatus;
  lines?: SalesOrderB2CLine[];
  createdByUser?: User;
}

export interface CreateSalesOrderB2CInput {
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
  priceListId?: string; // Optional: Nếu không có, sẽ tự động tìm default price list
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

export interface UpdateSalesOrderB2CInput
  extends Partial<CreateSalesOrderB2CInput> {
  id: string;
}
