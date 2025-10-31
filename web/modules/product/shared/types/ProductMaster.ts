
// ========================================
// Product Master Type
// ========================================

import { LocaleDataType } from "@/module-base/shared/Locale";
import { User } from "@base/shared/User";
import { ProductCategory } from "./ProductCategory";
import { ProductAttribute } from "./ProductAttribute";


export enum ProductMasterEnum {
  GOODS = "goods", // Hàng hóa thông thường
  SERVICE = "service", // Dịch vụ
  FINISHED_GOOD = "finished_good", // Thành phẩm (MFG output)
  RAW_MATERIAL = "raw_material", // Nguyên liệu (MFG input)
  CONSUMABLE = "consumable", // Vật tư tiêu hao
  ASSET = "asset", // Tài sản/CCDC
  TOOL = "tool", // Công cụ / thiết bị
}
export type ProductMasterType = `${ProductMasterEnum}`;

// ========================================
// Product Features (Module Gates)
// ========================================
export interface ProductMasterFeatures {
  sale: boolean; // Có thể bán
  purchase: boolean; // Có thể mua
  manufacture: boolean; // Có thể sản xuất (make)
  subcontract: boolean; // Có thể gia công ngoài
  stockable: boolean; // Có thể lưu kho
  maintenance: boolean; // Có thể bảo trì,
  asset: boolean; // Có thể là tài sản,
  accounting: boolean; // Khấu hao lâu dài
}
/**
 * | Trường hợp               | product.type    | Module chính               | Mục tiêu                  |
| ------------------------ | --------------- | -------------------------- | ------------------------- |
| Nguyên vật liệu sản xuất | `raw_material`  | MRP, Purchase, Inventory   | Input của BOM             |
| Thành phẩm sản xuất      | `finished_good` | MRP, Sales, Inventory      | Output của sản xuất       |
| Hàng hóa mua bán         | `goods`         | Sales, Purchase, Inventory | Hàng thương mại           |
| Hàng tiêu hao nội bộ     | `consumable`    | Purchase, Inventory        | Dùng và hết               |
| Công cụ / thiết bị       | `tool`          | Maintenance, Purchase      | Dùng nhiều lần, bảo dưỡng |
| Tài sản cố định          | `asset`         | Asset, Accounting          | Khấu hao lâu dài          |
| Dịch vụ                  | `service`       | Sales, Purchase            | Không tồn kho             |

 */


// ========================================
// Layer 1: Master Product (Template/Identity)
// ========================================
export type MasterProductId = string; // uuid v7
export interface MasterProduct {
    id: MasterProductId;
    code: string; // Unique product code
    name: LocaleDataType<string>;
    image?: string;
    description?: LocaleDataType<string>;
    // Core classification
    type: ProductMasterType;
    // Business features (module gates)
    features: Partial<ProductMasterFeatures>;
    // Status
    isActive: boolean;

    // Metadata
    brand?: LocaleDataType<string>;
    category?: ProductCategory;

    createdAt?: number; // unix timestamp (ms)
    updatedAt?: number; // unix timestamp (ms)
    createdBy?: User;
    updatedBy?: User;
    attributes?: ProductAttribute[];
  }