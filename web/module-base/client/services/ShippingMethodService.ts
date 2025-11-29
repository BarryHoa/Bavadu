import ClientHttpService from "@base/client/services/ClientHttpService";
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

export default class ShippingMethodService extends ClientHttpService {
  constructor() {
    super("/api/base/master-data/shipping-methods");
  }

  getList() {
    return this.get<{
      data: ShippingMethodDto[];
      message?: string;
    }>("/");
  }
}

export const shippingMethodService = new ShippingMethodService();

