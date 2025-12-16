import type { OptionalFieldDefinition } from "./types";

export const finishedGoodOptionalFields: OptionalFieldDefinition[] = [
  {
    field: "defaultSalePrice",
    type: "number",
    label: { vi: "Giá bán mặc định", en: "Default sale price" },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "defaultManufacturingCost",
    type: "number",
    label: {
      vi: "Chi phí sản xuất mặc định",
      en: "Default manufacturing cost",
    },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "billOfMaterialsId",
    type: "string",
    label: { vi: "BOM (Bill of Materials)", en: "BOM (Bill of Materials)" },
    isRequired: false,
  },
  {
    field: "productionTime",
    type: "integer",
    label: {
      vi: "Thời gian sản xuất (phút)",
      en: "Production time (minutes)",
    },
    isRequired: false,
    validation: { min: 0 },
  },
  {
    field: "productionUnit",
    type: "string",
    label: { vi: "Đơn vị sản xuất", en: "Production unit" },
    isRequired: false,
    validation: { maxLength: 50 },
  },
  {
    field: "qualityStandard",
    type: "string",
    label: { vi: "Tiêu chuẩn chất lượng", en: "Quality standard" },
    isRequired: false,
  },
];
