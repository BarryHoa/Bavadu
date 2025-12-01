import { dropdownOptionsService } from "@base/client/services";
import ClientHttpService from "@base/client/services/ClientHttpService";

export interface PriceListB2CDto {
  id: string;
  code: string;
  name: string | { en: string; vi: string };
  description?: string | null;
  type: "standard" | "promotion" | "seasonal" | "flash_sale";
  status: "draft" | "active" | "inactive" | "expired";
  priority: number;
  currencyId?: string | null;
  validFrom: string;
  validTo?: string | null;
  isDefault: boolean;
  applicableTo: {
    channels?: string[];
    stores?: string[];
    locations?: string[];
    regions?: string[];
    customerGroups?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface CreatePriceListB2CParams {
  code: string;
  name: { en: string; vi: string };
  description?: string;
  type: "standard" | "promotion" | "seasonal" | "flash_sale";
  status: "draft" | "active" | "inactive" | "expired";
  priority?: number;
  currencyId?: string;
  validFrom: string;
  validTo?: string | null;
  isDefault?: boolean;
  applicableTo: {
    channels?: string[];
    stores?: string[];
    locations?: string[];
    regions?: string[];
    customerGroups?: string[];
  };
}

export interface UpdatePriceListB2CParams {
  id: string;
  name?: { en: string; vi: string };
  description?: string;
  type?: "standard" | "promotion" | "seasonal" | "flash_sale";
  status?: "draft" | "active" | "inactive" | "expired";
  priority?: number;
  currencyId?: string;
  validFrom?: string;
  validTo?: string | null;
  isDefault?: boolean;
  applicableTo?: {
    channels?: string[];
    stores?: string[];
    locations?: string[];
    regions?: string[];
    customerGroups?: string[];
  };
}

export default class PriceListB2CService extends ClientHttpService {
  constructor() {
    super("/api/b2c-sales/price-lists");
  }

  list() {
    return this.get<{
      data: PriceListB2CDto[];
      total: number;
      message?: string;
    }>("/");
  }

  getById(id: string) {
    return this.get<{
      data: PriceListB2CDto;
      message?: string;
    }>(`/detail?id=${id}`);
  }

  create(payload: CreatePriceListB2CParams) {
    return this.post<{
      data: PriceListB2CDto;
      message?: string;
    }>("/create", payload);
  }

  update(payload: UpdatePriceListB2CParams) {
    return this.put<{
      data: PriceListB2CDto;
      message?: string;
    }>("/update", payload);
  }

  deleteById(id: string) {
    return this.delete<{
      message?: string;
    }>(`/delete?id=${id}`);
  }

  // For view list data table
  getData(params: {
    offset?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, any>;
    sorts?: Array<{ column: string; direction: "ascending" | "descending" }>;
  }) {
    return this.post<{
      data: PriceListB2CDto[];
      total: number;
      message?: string;
    }>("/", { params });
  }

  // Get dropdown options using dropdown-options API
  getOptionsDropdown(params?: {
    offset?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, any>;
    sorts?: Array<{ column: string; direction: "ascending" | "descending" }>;
  }) {
    return dropdownOptionsService.getOptionsDropdown(
      "list.b2c-sales.price-list",
      params
    );
  }
}

export const priceListB2CService = new PriceListB2CService();
