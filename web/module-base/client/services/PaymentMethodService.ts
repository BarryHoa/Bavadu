import ClientHttpService from "@base/client/services/ClientHttpService";
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
}

export const paymentMethodService = new PaymentMethodService();

