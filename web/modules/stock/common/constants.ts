export const warehouseStatuses = [
  "ACTIVE",
  "MAINTENANCE",
  "SUSPENDED",
  "CLOSED",
] as const;

export type WarehouseStatus = (typeof warehouseStatuses)[number];

export const warehouseValuationMethods = ["FIFO", "LIFO", "AVG"] as const;

export type WarehouseValuationMethod =
  (typeof warehouseValuationMethods)[number];

export type WarehouseAddress = {
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
};
