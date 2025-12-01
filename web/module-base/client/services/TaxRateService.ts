import ClientHttpService from "@base/client/services/ClientHttpService";
import { dropdownOptionsService } from "@base/client/services/DropdownOptionsService";
import type { LocaleDataType } from "@base/server/interfaces/Locale";

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

export default class TaxRateService extends ClientHttpService {
  constructor() {
    super("/api/base/master-data/tax-rates");
  }

  getList() {
    return this.get<{
      data: TaxRateDto[];
      message?: string;
    }>("/");
  }

  getOptionsDropdown() {
    return dropdownOptionsService.getOptionsDropdown("tax-rate");
  }
}

export const taxRateService = new TaxRateService();
