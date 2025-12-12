import type { LocaleDataType } from "@base/server/interfaces/Locale";
import type {
  BaseTbPaymentMethod,
  BaseTbPaymentTerm,
  BaseTbShippingMethod,
  BaseTbShippingTerm,
  BaseTbTaxRate,
} from "@base/server/schemas";

export interface PaymentMethod extends Omit<BaseTbPaymentMethod, "name" | "description"> {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
}

export interface PaymentTerm extends Omit<BaseTbPaymentTerm, "name" | "description"> {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
}

export interface ShippingMethod extends Omit<BaseTbShippingMethod, "name" | "description"> {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
}

export interface ShippingTerm extends Omit<BaseTbShippingTerm, "name" | "description"> {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
}

export interface TaxRate extends Omit<BaseTbTaxRate, "name" | "description"> {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
}
