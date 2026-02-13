import type { LocaleDataType } from "@base/shared/interface/Locale";

import { dropdownOptionsService } from "@base/client/services/DropdownOptionsService";

export interface ShippingTermDto {
  id: string;
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
  isActive: boolean;
  order: string;
  createdAt?: string;
  updatedAt?: string;
}

export default class ShippingTermService {
  getOptionsDropdown() {
    return dropdownOptionsService.getOptionsDropdown("base-shipping-term.dropdown");
  }
}

export const shippingTermService = new ShippingTermService();
