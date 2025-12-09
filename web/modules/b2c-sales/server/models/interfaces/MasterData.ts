import type { LocaleDataType } from "@base/server/interfaces/Locale";
import type {
  TblPaymentMethod,
  TblPaymentTerm,
  TblShippingMethod,
  TblShippingTerm,
  TblTaxRate,
} from "@base/server/schemas";

export interface PaymentMethod extends Omit<TblPaymentMethod, "name" | "description"> {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
}

export interface PaymentTerm extends Omit<TblPaymentTerm, "name" | "description"> {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
}

export interface ShippingMethod extends Omit<TblShippingMethod, "name" | "description"> {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
}

export interface ShippingTerm extends Omit<TblShippingTerm, "name" | "description"> {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
}

export interface TaxRate extends Omit<TblTaxRate, "name" | "description"> {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
}

