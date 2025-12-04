import { dropdownOptionsService } from "@base/client/services";
import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

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

export default class PriceListB2CService extends JsonRpcClientService {
  constructor() {
    super("/api/base/internal/json-rpc");
  }

  list() {
    return this.call<{
      data: PriceListB2CDto[];
      total: number;
      message?: string;
    }>("b2c-sales.price-list.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: PriceListB2CDto;
      message?: string;
    }>("b2c-sales.price-list.curd.getById", { id });
  }

  create(payload: CreatePriceListB2CParams) {
    return this.call<{
      data: PriceListB2CDto;
      message?: string;
    }>("b2c-sales.price-list.curd.create", payload);
  }

  update(payload: UpdatePriceListB2CParams) {
    return this.call<{
      data: PriceListB2CDto;
      message?: string;
    }>("b2c-sales.price-list.curd.update", payload);
  }

  deleteById(id: string) {
    return this.call<{
      message?: string;
    }>("b2c-sales.price-list.curd.delete", { id });
  }

  // For view list data table
  getData(params: {
    offset?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, any>;
    sorts?: Array<{ column: string; direction: "ascending" | "descending" }>;
  }) {
    return this.call<{
      data: PriceListB2CDto[];
      total: number;
      message?: string;
    }>("b2c-sales.price-list.list.getData", params);
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
      "b2c-sales.price-list.dropdown",
      params
    );
  }
}

export const priceListB2CService = new PriceListB2CService();
