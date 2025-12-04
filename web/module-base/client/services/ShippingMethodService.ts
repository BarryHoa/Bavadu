import { dropdownOptionsService } from "@base/client/services/DropdownOptionsService";
import type { LocaleDataType } from "@base/server/interfaces/Locale";

export interface ShippingMethodDto {
  id: string;
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
  baseFee?: string | null;
  isActive: boolean;
  order: string;
  createdAt?: string;
  updatedAt?: string;
}

export default class ShippingMethodService {
  getOptionsDropdown() {
    return dropdownOptionsService.getOptionsDropdown(
      "shipping-method.dropdown"
    );
  }
}

export const shippingMethodService = new ShippingMethodService();
