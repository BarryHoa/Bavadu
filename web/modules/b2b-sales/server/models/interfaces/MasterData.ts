import type { LocaleDataType } from "@base/server/interfaces/Locale";
import type {
  TblPaymentMethod,
  TblPaymentTerm,
  TblShippingMethod,
  TblShippingTerm,
  TblTaxRate,
} from "@base/server/schemas";

export interface PaymentMethod extends TblPaymentMethod {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
}

export interface PaymentTerm extends TblPaymentTerm {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
}

export interface ShippingMethod extends TblShippingMethod {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
}

export interface ShippingTerm extends TblShippingTerm {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
}

export interface TaxRate extends TblTaxRate {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
}
