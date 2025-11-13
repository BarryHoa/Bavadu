import type {
  WarehouseAddress,
  WarehouseStatus,
  WarehouseValuationMethod,
} from "../../../common/constants";
import type { TblStockWarehouse } from "../../schemas";

export function parseString(value: unknown) {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  return text.length ? text : undefined;
}

export function parseRequiredString(value: unknown, field: string) {
  const parsed = parseString(value);
  if (!parsed) {
    throw new Error(`${field} is required`);
  }
  return parsed;
}

export function parseNullableNumber(
  value: unknown,
  field: string
): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${field} must be a valid number`);
  }
  return parsed;
}

export function parseAddress(input: any): WarehouseAddress {
  if (!input || typeof input !== "object") {
    throw new Error("Address is required");
  }

  const line1 = parseRequiredString(input.line1, "Address line 1");
  const city = parseRequiredString(input.city, "City");
  const country = parseRequiredString(input.country, "Country");

  return {
    line1,
    line2: parseString(input.line2) ?? null,
    city,
    state: parseString(input.state) ?? null,
    postalCode: parseString(input.postalCode) ?? null,
    country,
  };
}

export type SerializedWarehouse = {
  id: string;
  code: string;
  name: string;
  typeCode: string;
  status: WarehouseStatus;
  companyId: string | null;
  managerId: string | null;
  contactId: string | null;
  address: WarehouseAddress;
  valuationMethod: WarehouseValuationMethod;
  minStock: number;
  maxStock: number | null;
  accountInventory: string | null;
  accountAdjustment: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const parseOptionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export function serializeWarehouse(
  warehouse: TblStockWarehouse
): SerializedWarehouse {
  const minStock = parseOptionalNumber(warehouse.minStock) ?? 0;
  const maxStock = parseOptionalNumber(warehouse.maxStock);

  return {
    id: warehouse.id,
    code: warehouse.code,
    name: warehouse.name,
    typeCode: warehouse.typeCode,
    status: warehouse.status as WarehouseStatus,
    companyId: warehouse.companyId ?? null,
    managerId: warehouse.managerId ?? null,
    contactId: warehouse.contactId ?? null,
    address: warehouse.address,
    valuationMethod: warehouse.valuationMethod as WarehouseValuationMethod,
    minStock,
    maxStock,
    accountInventory: warehouse.accountInventory ?? null,
    accountAdjustment: warehouse.accountAdjustment ?? null,
    notes: warehouse.notes ?? null,
    createdAt:
      warehouse.createdAt instanceof Date
        ? warehouse.createdAt.toISOString()
        : warehouse.createdAt ?? null,
    updatedAt:
      warehouse.updatedAt instanceof Date
        ? warehouse.updatedAt.toISOString()
        : warehouse.updatedAt ?? null,
  };
}

