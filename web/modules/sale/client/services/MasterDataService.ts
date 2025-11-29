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

export default class MasterDataService extends ClientHttpService {
  constructor() {
    super("/api/modules/sale/master-data");
  }

  getPaymentMethods() {
    return this.get<{
      data: PaymentMethodDto[];
      message?: string;
    }>("/payment-methods");
  }

  getPaymentTerms() {
    return this.get<{
      data: PaymentTermDto[];
      message?: string;
    }>("/payment-terms");
  }

  getShippingMethods() {
    return this.get<{
      data: ShippingMethodDto[];
      message?: string;
    }>("/shipping-methods");
  }

  getShippingTerms() {
    return this.get<{
      data: ShippingTermDto[];
      message?: string;
    }>("/shipping-terms");
  }

  getTaxRates() {
    return this.get<{
      data: TaxRateDto[];
      message?: string;
    }>("/tax-rates");
  }
}

export const masterDataService = new MasterDataService();

