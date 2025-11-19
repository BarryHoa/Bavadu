import type { OptionalFieldDefinition } from "./types";

export const rawMaterialOptionalFields: OptionalFieldDefinition[] = [
  {
    field: "defaultPurchasePrice",
    type: "number",
    label: { vi: "Giá mua mặc định", en: "Default purchase price" },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "specifications",
    type: "json",
    label: { vi: "Thông số kỹ thuật", en: "Specifications" },
    description: {
      vi: "Các thông số kỹ thuật (dạng key-value)",
      en: "Technical specifications (key-value pairs)",
    },
    isRequired: false,
  },
  {
    field: "qualityStandard",
    type: "string",
    label: { vi: "Tiêu chuẩn chất lượng", en: "Quality standard" },
    isRequired: false,
  },
  {
    field: "primarySupplierId",
    type: "string",
    label: { vi: "Nhà cung cấp chính", en: "Primary supplier" },
    isRequired: false,
  },
  {
    field: "leadTimeDays",
    type: "integer",
    label: { vi: "Thời gian giao hàng (ngày)", en: "Lead time (days)" },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "safetyStock",
    type: "number",
    label: { vi: "Tồn kho an toàn", en: "Safety stock" },
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
];

