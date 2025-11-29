import ClientHttpService from "@base/client/services/ClientHttpService";
import type { LocaleDataType } from "@base/server/interfaces/Locale";

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

export default class ShippingTermService extends ClientHttpService {
  constructor() {
    super("/api/base/master-data/shipping-terms");
  }

  getList() {
    return this.get<{
      data: ShippingTermDto[];
      message?: string;
    }>("/");
  }
}

export const shippingTermService = new ShippingTermService();

