import { ProductMasterFeatures, ProductMasterType } from "../interface/Product";

/**
 * Default features for each product type
 * Based on business logic constraints
 */
export const DEFAULT_FEATURES_BY_TYPE: Record<
  ProductMasterType,
  Partial<Record<ProductMasterFeatures, boolean>>
> = {
  // GOODS - Hàng hóa mua bán
  [ProductMasterType.GOODS]: {
    [ProductMasterFeatures.SALE]: true,
    [ProductMasterFeatures.PURCHASE]: true,
    [ProductMasterFeatures.STOCKABLE]: true,
    [ProductMasterFeatures.MANUFACTURE]: false,
    [ProductMasterFeatures.SUBCONTRACT]: false,
    [ProductMasterFeatures.MAINTENANCE]: false,
    [ProductMasterFeatures.ASSET]: false,
    [ProductMasterFeatures.ACCOUNTING]: false,
  },

  // SERVICE - Dịch vụ (không tồn kho)
  [ProductMasterType.SERVICE]: {
    [ProductMasterFeatures.SALE]: true,
    [ProductMasterFeatures.PURCHASE]: true,
    [ProductMasterFeatures.STOCKABLE]: false, // ← QUAN TRỌNG: Service không tồn kho
    [ProductMasterFeatures.MANUFACTURE]: false,
    [ProductMasterFeatures.SUBCONTRACT]: false,
    [ProductMasterFeatures.MAINTENANCE]: false,
    [ProductMasterFeatures.ASSET]: false,
    [ProductMasterFeatures.ACCOUNTING]: false,
  },

  // FINISHED_GOOD - Thành phẩm sản xuất
  [ProductMasterType.FINISHED_GOOD]: {
    [ProductMasterFeatures.SALE]: false, // Tùy chọn
    [ProductMasterFeatures.PURCHASE]: false, // Tùy chọn
    [ProductMasterFeatures.STOCKABLE]: true, // Bắt buộc
    [ProductMasterFeatures.MANUFACTURE]: true, // Bắt buộc
    [ProductMasterFeatures.SUBCONTRACT]: false, // Tùy chọn
    [ProductMasterFeatures.MAINTENANCE]: false, // Tùy chọn
    [ProductMasterFeatures.ASSET]: false, // Tùy chọn
    [ProductMasterFeatures.ACCOUNTING]: false, // Tùy chọn
  },

  // RAW_MATERIAL - Nguyên vật liệu
  [ProductMasterType.RAW_MATERIAL]: {
    [ProductMasterFeatures.SALE]: false, // Tùy chọn
    [ProductMasterFeatures.PURCHASE]: true, // Bắt buộc
    [ProductMasterFeatures.STOCKABLE]: true, // Bắt buộc
    [ProductMasterFeatures.MANUFACTURE]: true, // Bắt buộc (input)
    [ProductMasterFeatures.SUBCONTRACT]: false, // Tùy chọn
    [ProductMasterFeatures.MAINTENANCE]: false, // Tùy chọn
    [ProductMasterFeatures.ASSET]: false, // Tùy chọn
    [ProductMasterFeatures.ACCOUNTING]: false, // Tùy chọn
  },

  // CONSUMABLE - Vật tư tiêu hao
  [ProductMasterType.CONSUMABLE]: {
    [ProductMasterFeatures.SALE]: false, // Tùy chọn
    [ProductMasterFeatures.PURCHASE]: true, // Bắt buộc
    [ProductMasterFeatures.STOCKABLE]: true, // Bắt buộc
    [ProductMasterFeatures.MANUFACTURE]: false, // Không được phép
    [ProductMasterFeatures.SUBCONTRACT]: false, // Không được phép
    [ProductMasterFeatures.MAINTENANCE]: false, // Tùy chọn
    [ProductMasterFeatures.ASSET]: false, // Tùy chọn
    [ProductMasterFeatures.ACCOUNTING]: false, // Tùy chọn
  },

  // TOOL - Công cụ/Thiết bị
  [ProductMasterType.TOOL]: {
    [ProductMasterFeatures.SALE]: false, // Tùy chọn
    [ProductMasterFeatures.PURCHASE]: true, // Bắt buộc
    [ProductMasterFeatures.STOCKABLE]: false, // Tùy chọn
    [ProductMasterFeatures.MANUFACTURE]: false, // Không được phép
    [ProductMasterFeatures.SUBCONTRACT]: false, // Không được phép
    [ProductMasterFeatures.MAINTENANCE]: true, // Bắt buộc
    [ProductMasterFeatures.ASSET]: false, // Tùy chọn
    [ProductMasterFeatures.ACCOUNTING]: false, // Tùy chọn
  },

  // ASSET - Tài sản cố định
  [ProductMasterType.ASSET]: {
    [ProductMasterFeatures.SALE]: false, // Tùy chọn
    [ProductMasterFeatures.PURCHASE]: true, // Bắt buộc
    [ProductMasterFeatures.STOCKABLE]: false, // Tùy chọn
    [ProductMasterFeatures.MANUFACTURE]: false, // Không được phép
    [ProductMasterFeatures.SUBCONTRACT]: false, // Không được phép
    [ProductMasterFeatures.MAINTENANCE]: false, // Tùy chọn
    [ProductMasterFeatures.ASSET]: true, // Bắt buộc
    [ProductMasterFeatures.ACCOUNTING]: true, // Bắt buộc
  },
};

/**
 * Required features for each product type (must be true)
 */
export const REQUIRED_FEATURES_BY_TYPE: Record<
  ProductMasterType,
  ProductMasterFeatures[]
> = {
  [ProductMasterType.GOODS]: [
    ProductMasterFeatures.SALE,
    ProductMasterFeatures.PURCHASE,
    ProductMasterFeatures.STOCKABLE,
  ],
  [ProductMasterType.SERVICE]: [
    ProductMasterFeatures.SALE,
    ProductMasterFeatures.PURCHASE,
  ], // stockable phải false
  [ProductMasterType.FINISHED_GOOD]: [
    ProductMasterFeatures.STOCKABLE,
    ProductMasterFeatures.MANUFACTURE,
  ],
  [ProductMasterType.RAW_MATERIAL]: [
    ProductMasterFeatures.PURCHASE,
    ProductMasterFeatures.STOCKABLE,
    ProductMasterFeatures.MANUFACTURE,
  ],
  [ProductMasterType.CONSUMABLE]: [
    ProductMasterFeatures.PURCHASE,
    ProductMasterFeatures.STOCKABLE,
  ],
  [ProductMasterType.TOOL]: [
    ProductMasterFeatures.PURCHASE,
    ProductMasterFeatures.MAINTENANCE,
  ],
  [ProductMasterType.ASSET]: [
    ProductMasterFeatures.PURCHASE,
    ProductMasterFeatures.ASSET,
    ProductMasterFeatures.ACCOUNTING,
  ],
};

/**
 * Forbidden features for each product type (must be false)
 */
export const FORBIDDEN_FEATURES_BY_TYPE: Record<
  ProductMasterType,
  ProductMasterFeatures[]
> = {
  [ProductMasterType.GOODS]: [
    ProductMasterFeatures.MANUFACTURE,
    ProductMasterFeatures.SUBCONTRACT,
  ],
  [ProductMasterType.SERVICE]: [
    ProductMasterFeatures.STOCKABLE,
    ProductMasterFeatures.MANUFACTURE,
    ProductMasterFeatures.SUBCONTRACT,
  ],
  [ProductMasterType.FINISHED_GOOD]: [], // Không có feature bị cấm
  [ProductMasterType.RAW_MATERIAL]: [], // Không có feature bị cấm
  [ProductMasterType.CONSUMABLE]: [
    ProductMasterFeatures.MANUFACTURE,
    ProductMasterFeatures.SUBCONTRACT,
  ],
  [ProductMasterType.TOOL]: [
    ProductMasterFeatures.MANUFACTURE,
    ProductMasterFeatures.SUBCONTRACT,
  ],
  [ProductMasterType.ASSET]: [
    ProductMasterFeatures.MANUFACTURE,
    ProductMasterFeatures.SUBCONTRACT,
  ], // Asset không sản xuất
};

/**
 * Get default features for a product type
 */
export function getDefaultFeaturesForType(
  type: ProductMasterType
): Partial<Record<ProductMasterFeatures, boolean>> {
  return DEFAULT_FEATURES_BY_TYPE[type] || {};
}
