import type { OptionalFieldDefinition } from "./types";

export const goodsOptionalFields: OptionalFieldDefinition[] = [
  {
    field: "defaultSalePrice",
    type: "number",
    label: { vi: "Giá bán mặc định", en: "Default sale price" },
    description: {
      vi: "Giá bán mặc định (chỉ để tham khảo)",
      en: "Default sale price (for reference only)",
    },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "defaultPurchasePrice",
    type: "number",
    label: { vi: "Giá mua mặc định", en: "Default purchase price" },
    description: {
      vi: "Giá mua mặc định (chỉ để tham khảo)",
      en: "Default purchase price (for reference only)",
    },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "weight",
    type: "number",
    label: { vi: "Trọng lượng", en: "Weight" },
    description: { vi: "Trọng lượng (kg)", en: "Weight in kilograms" },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "dimensions",
    type: "json",
    label: { vi: "Kích thước", en: "Dimensions" },
    description: {
      vi: "Kích thước (dài, rộng, cao, đơn vị)",
      en: "Dimensions (length, width, height, unit)",
    },
    isRequired: false,
  },
  {
    field: "color",
    type: "string",
    label: { vi: "Màu sắc", en: "Color" },
    isRequired: false,
    validation: { maxLength: 50 },
  },
  {
    field: "style",
    type: "string",
    label: { vi: "Phong cách", en: "Style" },
    isRequired: false,
    validation: { maxLength: 100 },
  },
  {
    field: "expiryDate",
    type: "date",
    label: { vi: "Ngày hết hạn", en: "Expiry date" },
    isRequired: false,
  },
  {
    field: "expiryTracking",
    type: "boolean",
    label: { vi: "Theo dõi hết hạn", en: "Expiry tracking" },
    description: {
      vi: "Bật theo dõi ngày hết hạn",
      en: "Enable expiry date tracking",
    },
    isRequired: false,
  },
  {
    field: "storageConditions",
    type: "string",
    label: { vi: "Điều kiện bảo quản", en: "Storage conditions" },
    description: {
      vi: "Ví dụ: Nhiệt độ phòng, Tủ lạnh",
      en: "Example: Room temperature, Refrigerated",
    },
    isRequired: false,
  },
];
