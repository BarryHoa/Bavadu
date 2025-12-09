import type {
  PaymentMethodDto,
} from "@base/client/services/PaymentMethodService";
import type {
  PaymentTermDto,
} from "@base/client/services/PaymentTermService";
import type {
  ShippingMethodDto,
} from "@base/client/services/ShippingMethodService";
import type {
  ShippingTermDto,
} from "@base/client/services/ShippingTermService";
import type {
  TaxRateDto,
} from "@base/client/services/TaxRateService";

export type PaymentMethod = PaymentMethodDto;
export type PaymentTerm = PaymentTermDto;
export type ShippingMethod = ShippingMethodDto;
export type ShippingTerm = ShippingTermDto;
export type TaxRate = TaxRateDto;
