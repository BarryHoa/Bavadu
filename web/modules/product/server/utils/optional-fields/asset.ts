import type { OptionalFieldDefinition } from "./types";

export const assetOptionalFields: OptionalFieldDefinition[] = [
  {
    field: "assetCode",
    type: "string",
    label: { vi: "Mã tài sản", en: "Asset code" },
    isRequired: false,
    validation: { maxLength: 100 },
  },
  {
    field: "purchaseDate",
    type: "date",
    label: { vi: "Ngày mua", en: "Purchase date" },
    isRequired: false,
  },
  {
    field: "purchasePrice",
    type: "number",
    label: { vi: "Giá mua", en: "Purchase price" },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "depreciationMethod",
    type: "string",
    label: { vi: "Phương pháp khấu hao", en: "Depreciation method" },
    description: {
      vi: "straight-line, declining-balance",
      en: "straight-line, declining-balance",
    },
    isRequired: false,
    validation: { maxLength: 30 },
  },
  {
    field: "usefulLifeYears",
    type: "integer",
    label: {
      vi: "Thời gian sử dụng hữu ích (năm)",
      en: "Useful life (years)",
    },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "residualValue",
    type: "number",
    label: { vi: "Giá trị còn lại", en: "Residual value" },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "depreciationRate",
    type: "number",
    label: { vi: "Tỷ lệ khấu hao (%)", en: "Depreciation rate (%)" },
    isRequired: false,
    validation: { min: 0, max: 100 },
  },
  {
    field: "depreciationStartDate",
    type: "date",
    label: { vi: "Ngày bắt đầu khấu hao", en: "Depreciation start date" },
    isRequired: false,
  },
  {
    field: "currentValue",
    type: "number",
    label: { vi: "Giá trị hiện tại", en: "Current value" },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "location",
    type: "string",
    label: { vi: "Vị trí", en: "Location" },
    isRequired: false,
    validation: { maxLength: 200 },
  },
  {
    field: "assignedToUserId",
    type: "string",
    label: { vi: "Người được giao", en: "Assigned to user" },
    isRequired: false,
  },
];

