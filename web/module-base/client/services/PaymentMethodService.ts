import ClientHttpService from "@base/client/services/ClientHttpService";
import { dropdownOptionsService } from "@base/client/services/DropdownOptionsService";
import type { LocaleDataType } from "@base/server/interfaces/Locale";

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

export default class PaymentMethodService extends ClientHttpService {
  constructor() {
    super("/api/base/master-data/payment-methods");
  }

  getList() {
    return this.get<{
      data: PaymentMethodDto[];
      message?: string;
    }>("/");
  }

  getOptionsDropdown() {
    return dropdownOptionsService.getOptionsDropdown("payment-method");
  }
}

export const paymentMethodService = new PaymentMethodService();
