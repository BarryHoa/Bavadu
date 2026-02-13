import type { LocaleDataType } from "@base/shared/interface/Locale";

import { dropdownOptionsService } from "@base/client/services/DropdownOptionsService";

export interface PaymentMethodDto {
  id: string;
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
  isActive: boolean;
  order: string;
  createdAt?: string;
  updatedAt?: string;
}

export default class PaymentMethodService {
  getOptionsDropdown() {
    return dropdownOptionsService.getOptionsDropdown("base-payment-method.dropdown");
  }
}

export const paymentMethodService = new PaymentMethodService();
