import type { OptionalFieldDefinition } from "./types";

export const serviceOptionalFields: OptionalFieldDefinition[] = [
  {
    field: "defaultServicePrice",
    type: "number",
    label: { vi: "Giá dịch vụ mặc định", en: "Default service price" },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "unit",
    type: "string",
    label: { vi: "Đơn vị", en: "Unit" },
    description: {
      vi: "hour, day, month, project",
      en: "hour, day, month, project",
    },
    isRequired: false,
    validation: { maxLength: 20 },
  },
  {
    field: "duration",
    type: "integer",
    label: { vi: "Thời lượng", en: "Duration" },
    description: {
      vi: "Thời lượng theo đơn vị",
      en: "Duration in unit",
    },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "detailedDescription",
    type: "string",
    label: { vi: "Mô tả chi tiết", en: "Detailed description" },
    isRequired: false,
  },
  {
    field: "specialRequirements",
    type: "string",
    label: { vi: "Yêu cầu đặc biệt", en: "Special requirements" },
    isRequired: false,
  },
];
