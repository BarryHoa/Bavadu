import type { ListParamsResponse } from "@base/shared/interface/ListInterface";

import {
  ProductMasterEnum,
  type ProductMasterType,
} from "../interfaces/ProductMaster";

type ProductMasterTypeDropdownOption = {
  label: { en: string; vi: string } | string;
  value: string;
  [key: string]: any;
};

class ProductMasterTypeDropdownListModel {
  getData = async (): Promise<
    ListParamsResponse<ProductMasterTypeDropdownOption>
  > => {
    // Label mapping for product types
    const PRODUCT_TYPE_LABELS: Record<
      ProductMasterType,
      { en: string; vi: string }
    > = {
      [ProductMasterEnum.GOODS]: { en: "Goods", vi: "Hàng hóa" },
      [ProductMasterEnum.SERVICE]: { en: "Service", vi: "Dịch vụ" },
      [ProductMasterEnum.FINISHED_GOOD]: {
        en: "Finished Good",
        vi: "Thành phẩm",
      },
      [ProductMasterEnum.RAW_MATERIAL]: {
        en: "Raw Material",
        vi: "Nguyên liệu",
      },
      [ProductMasterEnum.CONSUMABLE]: {
        en: "Consumable",
        vi: "Vật tư tiêu hao",
      },
      [ProductMasterEnum.ASSET]: { en: "Asset", vi: "Tài sản" },
      [ProductMasterEnum.TOOL]: { en: "Tool", vi: "Công cụ" },
    };

    // Generate product types from enum
    const PRODUCT_TYPES = Object.values(ProductMasterEnum).map((value) => ({
      value: value as ProductMasterType,
      label: PRODUCT_TYPE_LABELS[value as ProductMasterType],
    }));

    return {
      data: PRODUCT_TYPES,
      total: PRODUCT_TYPES.length,
    };
  };
}

export default ProductMasterTypeDropdownListModel;
