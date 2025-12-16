import type { OptionalFieldDefinition } from "./types";

export const toolOptionalFields: OptionalFieldDefinition[] = [
  {
    field: "serialNumber",
    type: "string",
    label: { vi: "Số seri", en: "Serial number" },
    isRequired: false,
    validation: { maxLength: 100 },
  },
  {
    field: "modelNumber",
    type: "string",
    label: { vi: "Số model", en: "Model number" },
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
    field: "warrantyPeriodMonths",
    type: "integer",
    label: {
      vi: "Thời hạn bảo hành (tháng)",
      en: "Warranty period (months)",
    },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "maintenanceIntervalDays",
    type: "integer",
    label: { vi: "Chu kỳ bảo trì (ngày)", en: "Maintenance interval (days)" },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "lastMaintenanceDate",
    type: "date",
    label: { vi: "Ngày bảo trì cuối", en: "Last maintenance date" },
    isRequired: false,
  },
  {
    field: "nextMaintenanceDate",
    type: "date",
    label: { vi: "Ngày bảo trì tiếp theo", en: "Next maintenance date" },
    isRequired: false,
  },
  {
    field: "status",
    type: "string",
    label: { vi: "Trạng thái", en: "Status" },
    description: {
      vi: "in-use, maintenance, retired",
      en: "in-use, maintenance, retired",
    },
    isRequired: false,
    validation: { maxLength: 20 },
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
