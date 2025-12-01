import ClientHttpService from "@base/client/services/ClientHttpService";
import { dropdownOptionsService } from "@base/client/services/DropdownOptionsService";
import type { LocaleDataType } from "@base/server/interfaces/Locale";

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

export default class PaymentTermService extends ClientHttpService {
  constructor() {
    super("/api/base/master-data/payment-terms");
  }

  getList() {
    return this.get<{
      data: PaymentTermDto[];
      message?: string;
    }>("/");
  }

  getOptionsDropdown() {
    return dropdownOptionsService.getOptionsDropdown("payment-term");
  }
}

export const paymentTermService = new PaymentTermService();
