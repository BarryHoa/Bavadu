import type { OptionalFieldDefinition } from "./types";

export const consumableOptionalFields: OptionalFieldDefinition[] = [
  {
    field: "defaultPurchasePrice",
    type: "number",
    label: { vi: "Giá mua mặc định", en: "Default purchase price" },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "defaultMinStockLevel",
    type: "number",
    label: {
      vi: "Mức tồn kho tối thiểu mặc định",
      en: "Default minimum stock level",
    },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "defaultReorderPoint",
    type: "number",
    label: { vi: "Điểm đặt hàng mặc định", en: "Default reorder point" },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "expiryTracking",
    type: "boolean",
    label: { vi: "Theo dõi hết hạn", en: "Expiry tracking" },
    isRequired: false,
  },
  {
    field: "storageConditions",
    type: "string",
    label: { vi: "Điều kiện bảo quản", en: "Storage conditions" },
    isRequired: false,
  },
  {
    field: "packagingUnit",
    type: "string",
    label: { vi: "Đơn vị đóng gói", en: "Packaging unit" },
    description: {
      vi: "Ví dụ: hộp, thùng",
      en: "Example: box, carton",
    },
    isRequired: false,
    validation: { maxLength: 50 },
  },
];

