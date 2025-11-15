import { asc, eq, sql } from "drizzle-orm";

import { getEnv } from "@base/server";
import { BaseModel } from "@base/server/models/BaseModel";

import {
  WarehouseAddress,
  WarehouseStatus,
  WarehouseValuationMethod,
  warehouseStatuses,
  warehouseValuationMethods,
} from "../../../common/constants";
import type { NewTblStockWarehouse, TblStockWarehouse } from "../../schemas";
import { table_stock_warehouse } from "../../schemas";

export interface WarehousePayload {
  code: string;
  name: string;
  typeCode: string;
  status?: string | null;
  companyId?: string | null;
  managerId?: string | null;
  contactId?: string | null;
  address: WarehouseAddress;
  valuationMethod?: string | null;
  minStock?: number | null;
  maxStock?: number | null;
  accountInventory?: string | null;
  accountAdjustment?: string | null;
  notes?: string | null;
}

export interface WarehouseViewRow {
  id: string;
  code: string;
  name: string;
  typeCode: string;
  status: string;
  companyId: string | null;
  managerId: string | null;
  contactId: string | null;
  address: WarehouseAddress;
  valuationMethod: string;
  minStock: number;
  maxStock: number | null;
  accountInventory: string | null;
  accountAdjustment: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export default class WarehouseModel extends BaseModel<
  typeof table_stock_warehouse
> {
  constructor() {
    super(table_stock_warehouse);
  }

  listWarehouses = async (): Promise<TblStockWarehouse[]> => {
    const db = getEnv().getDb();
    return db
      .select()
      .from(table_stock_warehouse)
      .orderBy(asc(table_stock_warehouse.name));
  };

  getWarehouse = async (id: string): Promise<TblStockWarehouse | null> => {
    const db = getEnv().getDb();
    const [record] = await db
      .select()
      .from(table_stock_warehouse)
      .where(eq(table_stock_warehouse.id, id))
      .limit(1);

    return record ?? null;
  };

  createWarehouse = async (
    payload: WarehousePayload
  ): Promise<TblStockWarehouse> => {
    const db = getEnv().getDb();
    const insertPayload = this.normalizeWarehousePayload(payload);

    const [record] = await db
      .insert(table_stock_warehouse)
      .values(insertPayload)
      .returning();

    return record;
  };

  updateWarehouse = async (
    id: string,
    payload: WarehousePayload
  ): Promise<TblStockWarehouse> => {
    const db = getEnv().getDb();
    const [record] = await db
      .update(table_stock_warehouse)
      .set({
        ...this.normalizeWarehousePayload(payload),
        updatedAt: sql`now()`,
      })
      .where(eq(table_stock_warehouse.id, id))
      .returning();

    if (!record) {
      throw new Error("Warehouse not found");
    }

    return record;
  };

  private normalizeWarehousePayload = (
    payload: WarehousePayload
  ): Omit<NewTblStockWarehouse, "id" | "createdAt" | "updatedAt"> => {
    return {
      code: payload.code.trim(),
      name: payload.name.trim(),
      typeCode: payload.typeCode.trim(),
      status: this.validateStatus(payload.status),
      companyId: payload.companyId ?? null,
      managerId: payload.managerId ?? null,
      contactId: payload.contactId ?? null,
      address: payload.address,
      valuationMethod: this.validateValuationMethod(payload.valuationMethod),
      minStock:
        payload.minStock === undefined || payload.minStock === null
          ? undefined
          : payload.minStock.toString(),
      maxStock:
        payload.maxStock === undefined
          ? undefined
          : payload.maxStock === null
            ? null
            : payload.maxStock.toString(),
      accountInventory: payload.accountInventory ?? null,
      accountAdjustment: payload.accountAdjustment ?? null,
      notes: payload.notes ?? null,
    };
  };

  private validateStatus = (status?: string | null): WarehouseStatus => {
    if (!status) {
      return "ACTIVE";
    }

    const normalized = status.toUpperCase() as WarehouseStatus;
    if (!warehouseStatuses.includes(normalized)) {
      throw new Error(`Invalid warehouse status: ${status}`);
    }

    return normalized;
  };

  private validateValuationMethod = (
    value?: string | null
  ): WarehouseValuationMethod => {
    if (!value) {
      return "FIFO";
    }

    const normalized = value.toUpperCase() as WarehouseValuationMethod;
    if (!warehouseValuationMethods.includes(normalized)) {
      throw new Error(`Invalid warehouse valuation method: ${value}`);
    }

    return normalized;
  };
}
