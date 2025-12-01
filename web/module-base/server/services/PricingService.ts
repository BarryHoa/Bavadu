import { table_product_type_goods } from "@mdl/product/server/schemas/product-type-goods";
import { table_product_variant } from "@mdl/product/server/schemas/product-variant";
import { and, eq, gte, lte, or, sql } from "drizzle-orm";
import {
  table_price_list_items_b2c,
  table_price_lists_b2c,
  table_price_tiers_b2c,
  table_pricing_rules_b2c,
  TblPriceListItemB2C,
  TblPricingRuleB2C,
} from "@mdl/b2c-sales/server/schemas/price-list-b2c";
import getDbConnect from "../utils/getDbConnect";

export interface CalculatePriceParams {
  productVariantId: string;
  productMasterId: string;
  quantity: number;
  priceListId?: string; // Optional: Nếu không có, sẽ tự động tìm default price list
  customerGroupId?: string;
  channel?: string;
  region?: string;
  currentDate?: Date;
}

export interface PriceResult {
  unitPrice: number;
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  priceSource: "price_list" | "product_default";
  priceListItemId?: string;
  pricingRuleId?: string;
  appliedRules: string[];
}

export class PricingService {
  private db = getDbConnect();

  /**
   * Tính giá cho sản phẩm dựa trên price list và rules
   * Logic: Current Price List → Default Price List → Product Default + Rules
   */
  async calculatePrice(params: CalculatePriceParams): Promise<PriceResult> {
    const {
      productVariantId,
      productMasterId,
      quantity,
      priceListId,
      customerGroupId,
      channel,
      region,
      currentDate = new Date(),
    } = params;

    // 1. Lấy product default price (fallback cuối cùng)
    const product = await this.getProduct(productVariantId, productMasterId);
    const defaultPrice = product?.defaultSalePrice || 0;

    // 2. Xác định price list để dùng
    // Nếu không có priceListId → Tự động tìm bảng giá chính
    let activePriceListId = priceListId;
    if (!activePriceListId) {
      const defaultPriceList = await this.findDefaultPriceList();
      if (defaultPriceList) {
        activePriceListId = defaultPriceList.id;
      } else {
        // Không có price list nào (kể cả default) → Dùng product default price
        // Không áp dụng rules vì không có price list
        return {
          unitPrice: defaultPrice,
          basePrice: defaultPrice,
          discountAmount: 0,
          finalPrice: defaultPrice,
          priceSource: "product_default",
          appliedRules: [],
        };
      }
    }

    // 3. Tìm giá trong price list hiện tại (explicit pricing)
    let priceListItem = await this.findPriceListItem(
      activePriceListId,
      productVariantId,
      quantity,
      currentDate
    );

    // 4. Nếu không tìm thấy trong price list hiện tại → Tìm trong bảng giá chính (default)
    let defaultPriceListId: string | null = null;
    if (!priceListItem && activePriceListId) {
      // Tìm bảng giá chính (isDefault = true)
      const defaultPriceList = await this.findDefaultPriceList();
      if (defaultPriceList && defaultPriceList.id !== activePriceListId) {
        defaultPriceListId = defaultPriceList.id;
        priceListItem = await this.findPriceListItem(
          defaultPriceListId,
          productVariantId,
          quantity,
          currentDate
        );
      }
    }

    let basePrice = defaultPrice;
    let finalPrice = defaultPrice;
    let discountAmount = 0;
    const appliedRules: string[] = [];
    const finalPriceListId = priceListItem
      ? activePriceListId
      : defaultPriceListId || activePriceListId;

    if (priceListItem) {
      // Có explicit price (từ price list hiện tại hoặc bảng giá chính)
      basePrice = Number(
        priceListItem.basePrice ||
          priceListItem.salePrice ||
          priceListItem.finalPrice ||
          defaultPrice
      );
      finalPrice = Number(
        priceListItem.finalPrice || priceListItem.salePrice || basePrice
      );

      // Kiểm tra xem có rules với applyToExceptions = true không
      // Nếu có, rule đó sẽ override explicit price
      const rulesWithExceptions = await this.findApplicableRules(
        finalPriceListId || "",
        productMasterId,
        productVariantId,
        quantity,
        finalPrice, // Dùng explicit price làm basePrice cho rule
        customerGroupId,
        channel,
        region,
        currentDate,
        true // Chỉ tìm rules có applyToExceptions = true
      );

      // Áp dụng rules có applyToExceptions = true (nếu có)
      if (rulesWithExceptions.length > 0) {
        for (const rule of rulesWithExceptions.sort(
          (a, b) => b.priority - a.priority
        )) {
          const rulePrice = await this.applyRule(rule, finalPrice, quantity);
          if (rulePrice !== null) {
            finalPrice = rulePrice;
            if (basePrice > 0) {
              discountAmount = basePrice - finalPrice;
            }
            appliedRules.push(rule.id);
            break; // Chỉ áp dụng rule đầu tiên phù hợp
          }
        }
      }

      return {
        unitPrice: finalPrice,
        basePrice,
        discountAmount,
        finalPrice,
        priceSource: "price_list",
        priceListItemId: priceListItem.id,
        pricingRuleId: appliedRules[0] || undefined,
        appliedRules,
      };
    }

    // 4. Không có explicit price trong cả 2 bảng giá
    // → Dùng giá mặc định + áp dụng rules từ price list hiện tại
    // Chỉ lấy rules có applyToExceptions = false (rules thông thường)
    basePrice = defaultPrice;
    finalPrice = defaultPrice;

    const rules = await this.findApplicableRules(
      finalPriceListId || "",
      productMasterId,
      productVariantId,
      quantity,
      defaultPrice,
      customerGroupId,
      channel,
      region,
      currentDate,
      false // Chỉ lấy rules có applyToExceptions = false
    );

    // Áp dụng rules theo priority (cao → thấp)
    for (const rule of rules.sort((a, b) => b.priority - a.priority)) {
      const rulePrice = await this.applyRule(rule, defaultPrice, quantity);
      if (rulePrice !== null) {
        finalPrice = rulePrice;
        // Tính discount amount (chỉ khi có basePrice > 0)
        if (defaultPrice > 0) {
          discountAmount = defaultPrice - finalPrice;
        } else {
          // Nếu basePrice = 0, discount = 0 (rule đã set giá mới)
          discountAmount = 0;
        }
        appliedRules.push(rule.id);
        break; // Chỉ áp dụng rule đầu tiên phù hợp
      }
    }

    return {
      unitPrice: finalPrice,
      basePrice: defaultPrice,
      discountAmount,
      finalPrice,
      priceSource: appliedRules.length > 0 ? "price_list" : "product_default",
      pricingRuleId: appliedRules[0] || undefined,
      appliedRules,
    };
  }

  /**
   * Tìm bảng giá chính (default price list)
   */
  private async findDefaultPriceList(): Promise<{
    id: string;
    code: string;
  } | null> {
    const rows = await this.db
      .select({
        id: table_price_lists_b2c.id,
        code: table_price_lists_b2c.code,
      })
      .from(table_price_lists_b2c)
      .where(
        and(
          eq(table_price_lists_b2c.isDefault, true),
          eq(table_price_lists_b2c.status, "active"),
          or(
            sql`${table_price_lists_b2c.validFrom} IS NULL`,
            lte(table_price_lists_b2c.validFrom, new Date())
          ),
          or(
            sql`${table_price_lists_b2c.validTo} IS NULL`,
            gte(table_price_lists_b2c.validTo, new Date())
          )
        )
      )
      .orderBy(sql`${table_price_lists_b2c.priority} DESC`)
      .limit(1);

    return rows[0] || null;
  }

  /**
   * Lấy thông tin sản phẩm và giá mặc định
   */
  private async getProduct(
    productVariantId: string,
    productMasterId: string
  ): Promise<{ defaultSalePrice: number } | null> {
    const rows = await this.db
      .select({
        defaultSalePrice: table_product_type_goods.defaultSalePrice,
      })
      .from(table_product_variant)
      .leftJoin(
        table_product_type_goods,
        eq(table_product_variant.id, table_product_type_goods.productVariantId)
      )
      .where(eq(table_product_variant.id, productVariantId))
      .limit(1);

    const record = rows[0];
    if (!record) return null;

    return {
      defaultSalePrice: Number(record.defaultSalePrice || 0),
    };
  }

  /**
   * Tìm price list item phù hợp
   */
  private async findPriceListItem(
    priceListId: string,
    productVariantId: string,
    quantity: number,
    currentDate: Date
  ): Promise<TblPriceListItemB2C | null> {
    const rows = await this.db
      .select()
      .from(table_price_list_items_b2c)
      .where(
        and(
          eq(table_price_list_items_b2c.priceListId, priceListId),
          eq(table_price_list_items_b2c.productVariantId, productVariantId),
          eq(table_price_list_items_b2c.isActive, true),
          gte(table_price_list_items_b2c.minQuantity, quantity.toString()),
          or(
            sql`${table_price_list_items_b2c.maxQuantity} IS NULL`,
            lte(table_price_list_items_b2c.maxQuantity, quantity.toString())
          ),
          or(
            sql`${table_price_list_items_b2c.validFrom} IS NULL`,
            lte(table_price_list_items_b2c.validFrom, currentDate)
          ),
          or(
            sql`${table_price_list_items_b2c.validTo} IS NULL`,
            gte(table_price_list_items_b2c.validTo, currentDate)
          )
        )
      )
      .orderBy(sql`${table_price_list_items_b2c.priority} DESC`)
      .limit(1);

    return rows[0] || null;
  }

  /**
   * Tìm các pricing rules phù hợp
   * @param applyToExceptionsOnly - Nếu true, chỉ tìm rules có applyToExceptions = true
   */
  private async findApplicableRules(
    priceListId: string,
    productMasterId: string,
    productVariantId: string,
    quantity: number,
    basePrice: number,
    customerGroupId?: string,
    channel?: string,
    region?: string,
    currentDate?: Date,
    applyToExceptionsOnly?: boolean
  ): Promise<TblPricingRuleB2C[]> {
    const whereConditions = [
      eq(table_pricing_rules_b2c.priceListId, priceListId),
      eq(table_pricing_rules_b2c.isActive, true),
      gte(table_pricing_rules_b2c.minQuantity, quantity.toString()),
      or(
        sql`${table_pricing_rules_b2c.maxQuantity} IS NULL`,
        lte(table_pricing_rules_b2c.maxQuantity, quantity.toString())
      ),
      or(
        sql`${table_pricing_rules_b2c.validFrom} IS NULL`,
        lte(table_pricing_rules_b2c.validFrom, currentDate || new Date())
      ),
      or(
        sql`${table_pricing_rules_b2c.validTo} IS NULL`,
        gte(table_pricing_rules_b2c.validTo, currentDate || new Date())
      ),
    ];

    // Nếu applyToExceptionsOnly = true, chỉ lấy rules có applyToExceptions = true
    // Nếu applyToExceptionsOnly = false hoặc undefined, chỉ lấy rules có applyToExceptions = false
    if (applyToExceptionsOnly !== undefined) {
      whereConditions.push(
        eq(table_pricing_rules_b2c.applyToExceptions, applyToExceptionsOnly)
      );
    }

    const rules = await this.db
      .select()
      .from(table_pricing_rules_b2c)
      .where(and(...whereConditions))
      .orderBy(sql`${table_pricing_rules_b2c.priority} DESC`);

    // Filter rules by conditions
    return rules.filter((rule) => {
      const conditions = rule.conditions as any;
      if (!conditions) return true;

      // Check categories
      if (conditions.categories?.length > 0) {
        // TODO: Check if product belongs to any of these categories
        // This requires joining with product_master.categoryId
      }

      // Check brands
      if (conditions.brands?.length > 0) {
        // TODO: Check if product brand matches
      }

      // Check product types
      if (conditions.product_types?.length > 0) {
        // TODO: Check if product type matches
      }

      // Check product IDs (override)
      if (conditions.product_ids?.length > 0) {
        if (
          !conditions.product_ids.includes(productMasterId) &&
          !conditions.product_ids.includes(productVariantId)
        ) {
          return false;
        }
      }

      // Check exclude product IDs
      if (conditions.exclude_product_ids?.length > 0) {
        if (
          conditions.exclude_product_ids.includes(productMasterId) ||
          conditions.exclude_product_ids.includes(productVariantId)
        ) {
          return false;
        }
      }

      // Check price range
      if (conditions.min_base_price && basePrice < conditions.min_base_price) {
        return false;
      }
      if (conditions.max_base_price && basePrice > conditions.max_base_price) {
        return false;
      }

      // Check customer groups
      if (conditions.customer_groups?.length > 0) {
        if (
          !customerGroupId ||
          !conditions.customer_groups.includes(customerGroupId)
        ) {
          return false;
        }
      }

      // Check channels
      if (conditions.channels?.length > 0) {
        if (!channel || !conditions.channels.includes(channel)) {
          return false;
        }
      }

      // Check regions
      if (conditions.regions?.length > 0) {
        if (!region || !conditions.regions.includes(region)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Áp dụng pricing rule
   */
  private async applyRule(
    rule: TblPricingRuleB2C,
    basePrice: number,
    quantity: number
  ): Promise<number | null> {
    // Kiểm tra số lượng
    if (quantity < Number(rule.minQuantity || 1)) return null;
    if (rule.maxQuantity && quantity > Number(rule.maxQuantity)) return null;

    switch (rule.pricingMethod) {
      case "fixed":
        // Fixed price: Không cần basePrice, dùng giá cố định
        return rule.fixedPrice ? Number(rule.fixedPrice) : null;

      case "percentage":
        // Percentage discount: Cần basePrice > 0
        if (basePrice <= 0) {
          // Không có giá cơ sở → Không thể tính % discount
          return null;
        }
        if (rule.discountType === "percentage" && rule.discountValue) {
          const discount = (basePrice * Number(rule.discountValue)) / 100;
          return basePrice - discount;
        }
        return null;

      case "formula":
        // Formula: Cần basePrice > 0 (vì thường dùng basePrice trong formula)
        if (basePrice <= 0) {
          // Không có giá cơ sở → Không thể tính formula
          return null;
        }
        if (rule.formula) {
          // Đơn giản: "basePrice * 0.9" hoặc "basePrice - 10000"
          try {
            // Replace variables in formula
            let formula = rule.formula
              .replace(/basePrice/g, basePrice.toString())
              .replace(/quantity/g, quantity.toString());

            // Basic validation: only allow numbers, operators, and parentheses
            if (!/^[0-9+\-*/().\s]+$/.test(formula)) {
              return null;
            }

            // Use Function constructor for safer evaluation
            const result = new Function("return " + formula)();
            return typeof result === "number" ? result : null;
          } catch {
            return null;
          }
        }
        return null;

      case "tiered":
        // Tiered pricing: Không cần basePrice, dùng giá từ tiers
        return await this.findTierPrice(rule.id, quantity);

      default:
        return null;
    }
  }

  /**
   * Tìm giá từ price tier
   */
  private async findTierPrice(
    ruleId: string,
    quantity: number
  ): Promise<number | null> {
    const tiers = await this.db
      .select()
      .from(table_price_tiers_b2c)
      .where(
        and(
          eq(table_price_tiers_b2c.pricingRuleId, ruleId),
          gte(table_price_tiers_b2c.minQuantity, quantity.toString()),
          or(
            sql`${table_price_tiers_b2c.maxQuantity} IS NULL`,
            lte(table_price_tiers_b2c.maxQuantity, quantity.toString())
          )
        )
      )
      .orderBy(sql`${table_price_tiers_b2c.priority} DESC`)
      .limit(1);

    return tiers[0] ? Number(tiers[0].price) : null;
  }
}
