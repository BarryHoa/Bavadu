import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";

import { ProductMasterFeaturesEnum } from "../interfaces/ProductMaster";

type ProductFeaturesDropdownOption = {
  label: { en: string; vi: string } | string;
  value: string;
  [key: string]: any;
};

// Label mapping for product features
const PRODUCT_FEATURE_LABELS: Record<
  ProductMasterFeaturesEnum,
  { en: string; vi: string }
> = {
  [ProductMasterFeaturesEnum.SALE]: { en: "Sale", vi: "Bán hàng" },
  [ProductMasterFeaturesEnum.PURCHASE]: { en: "Purchase", vi: "Mua hàng" },
  [ProductMasterFeaturesEnum.MANUFACTURE]: {
    en: "Manufacture",
    vi: "Sản xuất",
  },
  [ProductMasterFeaturesEnum.SUBCONTRACT]: {
    en: "Subcontract",
    vi: "Gia công",
  },
  [ProductMasterFeaturesEnum.STOCKABLE]: { en: "Stockable", vi: "Lưu kho" },
  [ProductMasterFeaturesEnum.MAINTENANCE]: { en: "Maintenance", vi: "Bảo trì" },
  [ProductMasterFeaturesEnum.ASSET]: { en: "Asset", vi: "Tài sản" },
  [ProductMasterFeaturesEnum.ACCOUNTING]: { en: "Accounting", vi: "Kế toán" },
};

// Generate product features from enum
const PRODUCT_FEATURES = Object.values(ProductMasterFeaturesEnum).map(
  (key) => ({
    key,
    label: PRODUCT_FEATURE_LABELS[key],
  }),
);

class ProductFeaturesDropdownListModel {
  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<ProductFeaturesDropdownOption>> => {
    const { search, limit = 20, offset = 0 } = params;

    // Filter by search term if provided
    let filteredData = PRODUCT_FEATURES;

    if (search && typeof search === "string") {
      const searchLower = search.toLowerCase();

      filteredData = PRODUCT_FEATURES.filter(
        (feature) =>
          feature.label.en.toLowerCase().includes(searchLower) ||
          feature.label.vi.toLowerCase().includes(searchLower) ||
          feature.key.toLowerCase().includes(searchLower),
      );
    }

    // Apply pagination
    const paginatedData = filteredData.slice(offset, offset + limit);

    // Map to dropdown options
    const data = paginatedData.map((feature) => ({
      label: feature.label,
      value: feature.key,
    }));

    return {
      data,
      total: filteredData.length,
    };
  };
}

export default ProductFeaturesDropdownListModel;
