import type { LocaleDataType } from "@base/server/interfaces/Locale";

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
    return dropdownOptionsService.getOptionsDropdown("payment-method.dropdown");
  }
}

export const paymentMethodService = new PaymentMethodService();
