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
    sale: false, // Tùy chọn
    purchase: false, // Tùy chọn
    stockable: true, // Bắt buộc
    manufacture: true, // Bắt buộc
    subcontract: false, // Tùy chọn
    maintenance: false, // Tùy chọn
    asset: false, // Tùy chọn
    accounting: false, // Tùy chọn
  },

  // RAW_MATERIAL - Nguyên vật liệu
  raw_material: {
    sale: false, // Tùy chọn
    purchase: true, // Bắt buộc
    stockable: true, // Bắt buộc
    manufacture: true, // Bắt buộc (input)
    subcontract: false, // Tùy chọn
    maintenance: false, // Tùy chọn
    asset: false, // Tùy chọn
    accounting: false, // Tùy chọn
  },

  // CONSUMABLE - Vật tư tiêu hao
  consumable: {
    sale: false, // Tùy chọn
    purchase: true, // Bắt buộc
    stockable: true, // Bắt buộc
    manufacture: false, // Không được phép
    subcontract: false, // Không được phép
    maintenance: false, // Tùy chọn
    asset: false, // Tùy chọn
    accounting: false, // Tùy chọn
  },

  // TOOL - Công cụ/Thiết bị
  tool: {
    sale: false, // Tùy chọn
    purchase: true, // Bắt buộc
    stockable: false, // Tùy chọn
    manufacture: false, // Không được phép
    subcontract: false, // Không được phép
    maintenance: true, // Bắt buộc
    asset: false, // Tùy chọn
    accounting: false, // Tùy chọn
  },

  // ASSET - Tài sản cố định
  asset: {
    sale: false, // Tùy chọn
    purchase: true, // Bắt buộc
    stockable: false, // Tùy chọn
    manufacture: false, // Không được phép
    subcontract: false, // Không được phép
    maintenance: false, // Tùy chọn
    asset: true, // Bắt buộc
    accounting: true, // Bắt buộc
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
  finished_good: ["stockable", "manufacture"] as Array<
    keyof ProductMasterFeatures
  >,
  raw_material: ["purchase", "stockable", "manufacture"] as Array<
    keyof ProductMasterFeatures
  >,
  consumable: ["purchase", "stockable"] as Array<keyof ProductMasterFeatures>,
  tool: ["purchase", "maintenance"] as Array<keyof ProductMasterFeatures>,
  asset: ["purchase", "asset", "accounting"] as Array<
    keyof ProductMasterFeatures
  >,
};

/**
 * Forbidden features for each product type (must be false)
 */
export const FORBIDDEN_FEATURES_BY_TYPE: Record<
  ProductMasterType,
  Array<keyof ProductMasterFeatures>
> = {
  goods: ["manufacture", "subcontract"] as Array<keyof ProductMasterFeatures>,
  service: ["stockable", "manufacture", "subcontract"] as Array<
    keyof ProductMasterFeatures
  >,
  finished_good: [] as Array<keyof ProductMasterFeatures>, // Không có feature bị cấm
  raw_material: [] as Array<keyof ProductMasterFeatures>, // Không có feature bị cấm
  consumable: ["manufacture", "subcontract"] as Array<
    keyof ProductMasterFeatures
  >,
  tool: ["manufacture", "subcontract"] as Array<keyof ProductMasterFeatures>,
  asset: ["manufacture", "subcontract"] as Array<keyof ProductMasterFeatures>, // Asset không sản xuất
};

/**
 * Validate features against product type
 * Returns validation errors if any
 */
export function validateProductFeatures(
  type: ProductMasterType,
  features: Partial<ProductMasterFeatures>,
): string[] {
  const errors: string[] = [];
  const required = REQUIRED_FEATURES_BY_TYPE[type] || [];
  const forbidden = FORBIDDEN_FEATURES_BY_TYPE[type] || [];

  // Check required features
  for (const feature of required) {
    if (features[feature] !== true) {
      errors.push(
        `Product type "${type}" requires feature "${feature}" to be true`,
      );
    }
  }

  // Check forbidden features
  for (const feature of forbidden) {
    if (features[feature] === true) {
      errors.push(
        `Product type "${type}" cannot have feature "${feature}" set to true`,
      );
    }
  }

  return errors;
}

/**
 * Get default features for a product type
 */
export function getDefaultFeaturesForType(
  type: ProductMasterType,
): Partial<ProductMasterFeatures> {
  return DEFAULT_FEATURES_BY_TYPE[type] || {};
}

/**
 * Normalize features - merge user input with defaults and validate
 */
export function normalizeProductFeatures(
  type: ProductMasterType,
  userFeatures?: Partial<ProductMasterFeatures>,
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
