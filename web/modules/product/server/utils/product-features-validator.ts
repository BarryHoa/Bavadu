import type {
  ProductMasterFeatures,
  ProductMasterType,
} from "../models/interfaces/ProductMaster";

/**
 * Default features for each product type
 * Based on business logic constraints
 */
export const DEFAULT_FEATURES_BY_TYPE: Record<
  ProductMasterType,
  Partial<ProductMasterFeatures>
> = {
  // GOODS - Hàng hóa mua bán
  goods: {
    sale: true,
    purchase: true,
    stockable: true,
    manufacture: false,
    subcontract: false,
    maintenance: false,
    asset: false,
    accounting: false,
  },

  // SERVICE - Dịch vụ (không tồn kho)
  service: {
    sale: true,
    purchase: true, // Có thể mua dịch vụ từ nhà cung cấp
    stockable: false, // ← QUAN TRỌNG: Service không tồn kho
    manufacture: false,
    subcontract: false,
    maintenance: false,
    asset: false,
    accounting: false,
  },

  // FINISHED_GOOD - Thành phẩm sản xuất
  finished_good: {
    sale: true,
    purchase: false, // Tự sản xuất, không mua
    stockable: true,
    manufacture: true, // Có thể sản xuất
    subcontract: true, // Có thể gia công ngoài
    maintenance: false,
    asset: false,
    accounting: false,
  },

  // RAW_MATERIAL - Nguyên vật liệu
  raw_material: {
    sale: false, // Thường không bán nguyên vật liệu
    purchase: true,
    stockable: true,
    manufacture: true, // Có thể tự sản xuất nguyên vật liệu
    subcontract: false,
    maintenance: false,
    asset: false,
    accounting: false,
  },

  // CONSUMABLE - Vật tư tiêu hao
  consumable: {
    sale: false, // Dùng nội bộ, không bán
    purchase: true,
    stockable: true,
    manufacture: false,
    subcontract: false,
    maintenance: false,
    asset: false,
    accounting: false,
  },

  // TOOL - Công cụ/Thiết bị
  tool: {
    sale: false, // Dùng nội bộ
    purchase: true,
    stockable: true,
    manufacture: false,
    subcontract: false,
    maintenance: true, // ← QUAN TRỌNG: Tool cần bảo trì
    asset: false, // Tool không phải tài sản cố định
    accounting: false,
  },

  // ASSET - Tài sản cố định
  asset: {
    sale: false, // Tài sản cố định, không bán
    purchase: true,
    stockable: true,
    manufacture: false,
    subcontract: false,
    maintenance: true, // Có thể bảo trì
    asset: true, // ← QUAN TRỌNG: Asset = true
    accounting: true, // ← QUAN TRỌNG: Có khấu hao
  },
};

/**
 * Required features for each product type (must be true)
 */
export const REQUIRED_FEATURES_BY_TYPE: Record<
  ProductMasterType,
  Array<keyof ProductMasterFeatures>
> = {
  goods: ["sale", "purchase", "stockable"] as Array<
    keyof ProductMasterFeatures
  >,
  service: ["sale", "purchase"] as Array<keyof ProductMasterFeatures>, // stockable phải false
  finished_good: ["sale", "stockable", "manufacture"] as Array<
    keyof ProductMasterFeatures
  >,
  raw_material: ["purchase", "stockable"] as Array<keyof ProductMasterFeatures>,
  consumable: ["purchase", "stockable"] as Array<keyof ProductMasterFeatures>,
  tool: ["purchase", "stockable", "maintenance"] as Array<
    keyof ProductMasterFeatures
  >,
  asset: [
    "purchase",
    "stockable",
    "asset",
    "accounting",
    "maintenance",
  ] as Array<keyof ProductMasterFeatures>,
};

/**
 * Forbidden features for each product type (must be false)
 */
export const FORBIDDEN_FEATURES_BY_TYPE: Record<
  ProductMasterType,
  Array<keyof ProductMasterFeatures>
> = {
  goods: [
    "manufacture",
    "subcontract",
    "maintenance",
    "asset",
    "accounting",
  ] as Array<keyof ProductMasterFeatures>,
  service: [
    "stockable",
    "manufacture",
    "subcontract",
    "maintenance",
    "asset",
    "accounting",
  ] as Array<keyof ProductMasterFeatures>,
  finished_good: ["purchase"] as Array<keyof ProductMasterFeatures>, // Không mua thành phẩm
  raw_material: ["sale"] as Array<keyof ProductMasterFeatures>, // Không bán nguyên vật liệu
  consumable: [
    "sale",
    "manufacture",
    "subcontract",
    "maintenance",
    "asset",
    "accounting",
  ] as Array<keyof ProductMasterFeatures>,
  tool: ["sale", "manufacture", "subcontract", "asset", "accounting"] as Array<
    keyof ProductMasterFeatures
  >,
  asset: ["sale", "manufacture", "subcontract"] as Array<
    keyof ProductMasterFeatures
  >, // Asset không bán, không sản xuất
};

/**
 * Validate features against product type
 * Returns validation errors if any
 */
export function validateProductFeatures(
  type: ProductMasterType,
  features: Partial<ProductMasterFeatures>
): string[] {
  const errors: string[] = [];
  const required = REQUIRED_FEATURES_BY_TYPE[type] || [];
  const forbidden = FORBIDDEN_FEATURES_BY_TYPE[type] || [];

  // Check required features
  for (const feature of required) {
    if (features[feature] !== true) {
      errors.push(
        `Product type "${type}" requires feature "${feature}" to be true`
      );
    }
  }

  // Check forbidden features
  for (const feature of forbidden) {
    if (features[feature] === true) {
      errors.push(
        `Product type "${type}" cannot have feature "${feature}" set to true`
      );
    }
  }

  return errors;
}

/**
 * Get default features for a product type
 */
export function getDefaultFeaturesForType(
  type: ProductMasterType
): Partial<ProductMasterFeatures> {
  return DEFAULT_FEATURES_BY_TYPE[type] || {};
}

/**
 * Normalize features - merge user input with defaults and validate
 */
export function normalizeProductFeatures(
  type: ProductMasterType,
  userFeatures?: Partial<ProductMasterFeatures>
): Partial<ProductMasterFeatures> {
  const defaults = getDefaultFeaturesForType(type);

  // Merge: user input overrides defaults
  const merged: Partial<ProductMasterFeatures> = {
    ...defaults,
    ...userFeatures,
  };

  // Ensure forbidden features are false
  const forbidden = FORBIDDEN_FEATURES_BY_TYPE[type] || [];
  for (const feature of forbidden) {
    merged[feature] = false;
  }

  // Ensure required features are true
  const required = REQUIRED_FEATURES_BY_TYPE[type] || [];
  for (const feature of required) {
    merged[feature] = true;
  }

  return merged;
}
