import type { LocaleDataType } from "@base/server/interfaces/Locale";

import { dropdownOptionsService } from "@base/client/services/DropdownOptionsService";

export interface TaxRateDto {
  id: string;
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
  rate: string;
  isActive: boolean;
  order: string;
  createdAt?: string;
  updatedAt?: string;
}

export default class TaxRateService {
  getOptionsDropdown() {
    return dropdownOptionsService.getOptionsDropdown("tax-rate.dropdown");
  }
}

export const taxRateService = new TaxRateService();
