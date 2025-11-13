import { asc, eq, ilike, or, sql } from "drizzle-orm";

import { getEnv } from "@base/server";
import { BaseModel } from "@base/server/models/BaseModel";
import {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";

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

  async listWarehouses(): Promise<TblStockWarehouse[]> {
    const db = getEnv().getDb();
    return db
      .select()
      .from(table_stock_warehouse)
      .orderBy(asc(table_stock_warehouse.name));
  }

  async getWarehouse(id: string): Promise<TblStockWarehouse | null> {
    const db = getEnv().getDb();
    const [record] = await db
      .select()
      .from(table_stock_warehouse)
      .where(eq(table_stock_warehouse.id, id))
      .limit(1);

    return record ?? null;
  }

  async createWarehouse(payload: WarehousePayload): Promise<TblStockWarehouse> {
    const db = getEnv().getDb();
    const insertPayload = this.normalizeWarehousePayload(payload);

    const [record] = await db
      .insert(table_stock_warehouse)
      .values(insertPayload)
      .returning();

    return record;
  }

  async updateWarehouse(
    id: string,
    payload: WarehousePayload
  ): Promise<TblStockWarehouse> {
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
  }

  async getViewDataList(
    params: ListParamsRequest = {}
  ): Promise<ListParamsResponse<WarehouseViewRow>> {
    const { offset, limit, search } = this.getDefaultParamsForList(params);
    const db = getEnv().getDb();

    const baseQuery = db
      .select({
        id: this.table.id,
        code: this.table.code,
        name: this.table.name,
        typeCode: this.table.typeCode,
        status: this.table.status,
        companyId: this.table.companyId,
        managerId: this.table.managerId,
        contactId: this.table.contactId,
        address: this.table.address,
        valuationMethod: this.table.valuationMethod,
        minStock: this.table.minStock,
        maxStock: this.table.maxStock,
        accountInventory: this.table.accountInventory,
        accountAdjustment: this.table.accountAdjustment,
        notes: this.table.notes,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
        total: sql<number>`count(*) over()::int`.as("total"),
      })
      .from(this.table);

    let query: any = baseQuery;

    if (search) {
      const term = `%${String(search).trim()}%`;
      query = query.where(
        or(
          ilike(this.table.code, term),
          ilike(this.table.name, term),
          ilike(this.table.typeCode, term),
          ilike(this.table.status, term)
        )
      );
    }

    const records = (await query
      .orderBy(asc(this.table.name))
      .limit(limit)
      .offset(offset)) as Array<{
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
      minStock: string | number | null;
      maxStock: string | number | null;
      accountInventory: string | null;
      accountAdjustment: string | null;
      notes: string | null;
      createdAt: Date | null;
      updatedAt: Date | null;
      total: number;
    }>;

    const total = records.length > 0 ? records[0].total : 0;

    const data: WarehouseViewRow[] = records.map((record) => ({
      id: record.id,
      code: record.code,
      name: record.name,
      typeCode: record.typeCode,
      status: record.status,
      companyId: record.companyId ?? null,
      managerId: record.managerId ?? null,
      contactId: record.contactId ?? null,
      address: record.address as WarehouseAddress,
      valuationMethod: record.valuationMethod,
      minStock: Number(record.minStock ?? 0),
      maxStock:
        record.maxStock === null || record.maxStock === undefined
          ? null
          : Number(record.maxStock),
      accountInventory: record.accountInventory ?? null,
      accountAdjustment: record.accountAdjustment ?? null,
      notes: record.notes ?? null,
      createdAt: record.createdAt ? record.createdAt.toISOString() : null,
      updatedAt: record.updatedAt ? record.updatedAt.toISOString() : null,
    }));

    return this.getPagination({ data, total });
  }

  private normalizeWarehousePayload(
    payload: WarehousePayload
  ): Omit<NewTblStockWarehouse, "id" | "createdAt" | "updatedAt"> {
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
  }

  private validateStatus(status?: string | null): WarehouseStatus {
    if (!status) {
      return "ACTIVE";
    }

    const normalized = status.toUpperCase() as WarehouseStatus;
    if (!warehouseStatuses.includes(normalized)) {
      throw new Error(`Invalid warehouse status: ${status}`);
    }

    return normalized;
  }

  private validateValuationMethod(
    value?: string | null
  ): WarehouseValuationMethod {
    if (!value) {
      return "FIFO";
    }

    const normalized = value.toUpperCase() as WarehouseValuationMethod;
    if (!warehouseValuationMethods.includes(normalized)) {
      throw new Error(`Invalid warehouse valuation method: ${value}`);
    }

    return normalized;
  }
}
