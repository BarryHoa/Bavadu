import JsonRpcClientService from "./JsonRpcClientService";
import type { LocaleDataType } from "@base/server/interfaces/Locale";

export interface Currency {
  id: string;
  code: string;
  name: LocaleDataType<string>;
  symbol?: string;
  decimalPlaces: number;
  isDefault: boolean;
  isActive: boolean;
  currencyRateToVND: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface CurrencyListResponse {
  data: Currency[];
  message?: string;
}

export interface ExchangeRate {
  id: string;
  currencyId: string;
  currencyCode: string;
  currencyName: LocaleDataType<string>;
  currencySymbol?: string;
  rateDate: Date | string;
  exchangeRate: number;
  source?: string;
  note?: string;
  createdAt?: number;
}

export interface ExchangeRateResponse {
  data: ExchangeRate | ExchangeRate[];
  message?: string;
  error?: string;
}

class CurrencyService extends JsonRpcClientService {
  constructor() {
    super("/api/base/internal/json-rpc");
  }

  /**
   * Get list of all active currencies with their latest exchange rates
   * @returns List of currencies with exchange rates
   */
  async getList(): Promise<CurrencyListResponse> {
    return this.call<CurrencyListResponse>("currency.curd.getList", {});
  }

  /**
   * Get the latest exchange rate
   * @param options - Optional parameters to filter by currency
   * @param options.currencyId - Currency ID to get rate for
   * @param options.currencyCode - Currency code (e.g., "USD") to get rate for
   * @returns Latest exchange rate(s)
   */
  async getLatestRate(options?: {
    currencyId?: string;
    currencyCode?: string;
  }): Promise<ExchangeRateResponse> {
    return this.call<ExchangeRateResponse>(
      "currency.curd.getLatestRate",
      options || {}
    );
  }
}

const currencyService = new CurrencyService();
export default currencyService;

