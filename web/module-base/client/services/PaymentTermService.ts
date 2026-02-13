import type { LocaleDataType } from "@base/shared/interface/Locale";

import { dropdownOptionsService } from "@base/client/services/DropdownOptionsService";

export interface PaymentTermDto {
  id: string;
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
  days?: string | null;
  isActive: boolean;
  order: string;
  createdAt?: string;
  updatedAt?: string;
}

export default class PaymentTermService {
  getOptionsDropdown() {
    return dropdownOptionsService.getOptionsDropdown("base-payment-term.dropdown");
  }
}

export const paymentTermService = new PaymentTermService();
