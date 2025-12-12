import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import { desc, eq, ilike, sql } from "drizzle-orm";
import {
  sale_b2c_tb_price_lists,
  SaleB2cTbPriceList,
} from "../../schemas/b2c-sales.price-list";
import { PriceListValidationService } from "../../services/PriceListValidationService";

export interface PriceListB2CRow {
  id: string;
  code: string;
  name: string | { en: string; vi: string };
  description?: string | null;
  type: string;
  status: string;
  priority: number;
  currencyId?: string | null;
  validFrom: Date;
  validTo?: Date | null;
  isDefault: boolean;
  applicableTo: any;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface CreatePriceListB2CParams {
  code: string;
  name: { en: string; vi: string };
  description?: string;
  type: "standard" | "promotion" | "seasonal" | "flash_sale";
  status: "draft" | "active" | "inactive" | "expired";
  priority?: number;
  currencyId?: string;
  validFrom: Date;
  validTo?: Date | null;
  isDefault?: boolean;
  applicableTo: {
    channels?: string[];
    stores?: string[];
    locations?: string[];
    regions?: string[];
    customerGroups?: string[];
  };
  createdBy?: string;
}

export interface UpdatePriceListB2CParams {
  name?: { en: string; vi: string };
  description?: string;
  type?: "standard" | "promotion" | "seasonal" | "flash_sale";
  status?: "draft" | "active" | "inactive" | "expired";
  priority?: number;
  currencyId?: string;
  validFrom?: Date;
  validTo?: Date | null;
  isDefault?: boolean;
  applicableTo?: {
    channels?: string[];
    stores?: string[];
    locations?: string[];
    regions?: string[];
    customerGroups?: string[];
  };
  updatedBy?: string;
}

type PriceListFilter = {
  type?: string;
  status?: string;
  isDefault?: boolean;
};

export default class PriceListB2CViewListModel extends BaseViewListModel<
  typeof sale_b2c_tb_price_lists,
  PriceListB2CRow,
  PriceListFilter
> {
  private validationService: PriceListValidationService;

  constructor() {
    super({
      table: sale_b2c_tb_price_lists,
      sortDefault: [
        {
          column: "createdAt",
          direction: "descending",
        },
      ],
    });
    this.validationService = new PriceListValidationService();
  }

  protected declarationColumns = () => {
    const map = new Map();
    map.set("id", { column: sale_b2c_tb_price_lists.id, sort: false });
    map.set("code", { column: sale_b2c_tb_price_lists.code, sort: true });
    map.set("name", { column: sale_b2c_tb_price_lists.name, sort: false });
    map.set("type", { column: sale_b2c_tb_price_lists.type, sort: true });
    map.set("status", { column: sale_b2c_tb_price_lists.status, sort: true });
    map.set("priority", { column: sale_b2c_tb_price_lists.priority, sort: true });
    map.set("validFrom", {
      column: sale_b2c_tb_price_lists.validFrom,
      sort: true,
    });
    map.set("validTo", { column: sale_b2c_tb_price_lists.validTo, sort: true });
    map.set("isDefault", {
      column: sale_b2c_tb_price_lists.isDefault,
      sort: true,
    });
    map.set("createdAt", {
      column: sale_b2c_tb_price_lists.createdAt,
      sort: true,
    });
    map.set("updatedAt", {
      column: sale_b2c_tb_price_lists.updatedAt,
      sort: true,
    });
    return map;
  };

  protected declarationSearch = () =>
    new Map([
      [
        "code",
        (text: string) =>
          text ? ilike(sale_b2c_tb_price_lists.code, `%${text}%`) : undefined,
      ],
      [
        "name",
        (text: string) =>
          text
            ? sql`${sale_b2c_tb_price_lists.name}::text ILIKE ${`%${text}%`}`
            : undefined,
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<PriceListFilter> =>
    new Map([
      [
        "type",
        (value?: unknown, _filters?: PriceListFilter) =>
          typeof value === "string" && value
            ? eq(sale_b2c_tb_price_lists.type, value)
            : undefined,
      ],
      [
        "status",
        (value?: unknown, _filters?: PriceListFilter) =>
          typeof value === "string" && value
            ? eq(sale_b2c_tb_price_lists.status, value)
            : undefined,
      ],
      [
        "isDefault",
        (value?: unknown, _filters?: PriceListFilter) =>
          typeof value === "boolean"
            ? eq(sale_b2c_tb_price_lists.isDefault, value)
            : undefined,
      ],
    ]);

  protected declarationMappingData = (row: any): PriceListB2CRow => {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      type: row.type,
      status: row.status,
      priority: row.priority,
      currencyId: row.currencyId,
      validFrom: row.validFrom,
      validTo: row.validTo,
      isDefault: row.isDefault,
      applicableTo: row.applicableTo,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  };

  /**
   * Get list of price lists (simple list, not for view list data table)
   */
  async getList(): Promise<SaleB2cTbPriceList[]> {
    return this.db
      .select()
      .from(sale_b2c_tb_price_lists)
      .orderBy(
        desc(sale_b2c_tb_price_lists.priority),
        desc(sale_b2c_tb_price_lists.createdAt)
      );
  }

  /**
   * Get price list by ID
   */
  async getById(id: string): Promise<SaleB2cTbPriceList | null> {
    const [priceList] = await this.db
      .select()
      .from(sale_b2c_tb_price_lists)
      .where(eq(sale_b2c_tb_price_lists.id, id))
      .limit(1);

    return priceList || null;
  }

  /**
   * Create a new price list
   */
  async create(
    params: CreatePriceListB2CParams
  ): Promise<SaleB2cTbPriceList> {
    // Validate
    const validation = await this.validationService.validatePriceList(params);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    // Check if code already exists
    const existing = await this.isExistInModelByFieldAndValue({
      field: "code",
      value: params.code,
    });
    if (existing.isExist) {
      throw new Error(`Price list with code "${params.code}" already exists`);
    }

    const now = new Date();

    const [priceList] = await this.db
      .insert(sale_b2c_tb_price_lists)
      .values({
        code: params.code,
        name: params.name,
        description: params.description,
        type: params.type,
        status: params.status,
        priority: params.priority ?? 0,
        currencyId: params.currencyId,
        validFrom: params.validFrom,
        validTo: params.validTo,
        isDefault: params.isDefault ?? false,
        applicableTo: params.applicableTo,
        createdBy: params.createdBy,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    if (!priceList) {
      throw new Error("Failed to create price list");
    }

    return priceList;
  }

  /**
   * Update price list
   */
  async update(
    id: string,
    params: UpdatePriceListB2CParams
  ): Promise<SaleB2cTbPriceList> {
    // Get existing price list
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Price list with id "${id}" not found`);
    }

    // Merge with existing data for validation
    const mergedData = {
      ...existing,
      ...params,
      validFrom: params.validFrom ?? existing.validFrom,
      validTo: params.validTo !== undefined ? params.validTo : existing.validTo,
      applicableTo: params.applicableTo ?? existing.applicableTo,
    };

    // Validate
    const validation = await this.validationService.validatePriceList(
      mergedData,
      id
    );
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const now = new Date();

    const [priceList] = await this.db
      .update(sale_b2c_tb_price_lists)
      .set({
        name: params.name,
        description: params.description,
        type: params.type,
        status: params.status,
        priority: params.priority,
        currencyId: params.currencyId,
        validFrom: params.validFrom,
        validTo: params.validTo,
        isDefault: params.isDefault,
        applicableTo: params.applicableTo,
        updatedBy: params.updatedBy,
        updatedAt: now,
      })
      .where(eq(sale_b2c_tb_price_lists.id, id))
      .returning();

    if (!priceList) {
      throw new Error("Failed to update price list");
    }

    return priceList;
  }

  /**
   * Delete price list
   */
  async delete(id: string): Promise<boolean> {
    // Get existing price list
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Price list with id "${id}" not found`);
    }

    // Validate deletion (check if it's the last active standard price list)
    // Simulate deactivation by setting status to inactive
    const simulatedData = {
      ...existing,
      status: "inactive" as const,
    };
    const validation = await this.validationService.validatePriceList(
      simulatedData,
      id
    );
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const result = await this.db
      .delete(sale_b2c_tb_price_lists)
      .where(eq(sale_b2c_tb_price_lists.id, id))
      .returning();

    return result.length > 0;
  }
}
