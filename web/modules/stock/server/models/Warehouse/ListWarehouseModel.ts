import { asc, eq, ilike, or, sql } from "drizzle-orm";

import { getEnv } from "@base/server";
import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";

import {
  WarehouseAddress,
} from "../../../common/constants";
import type { TblStockWarehouse } from "../../schemas";
import { table_stock_warehouse } from "../../schemas";

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

class ListWarehouseModel extends BaseViewListModel<
  typeof table_stock_warehouse,
  WarehouseViewRow
> {
  constructor() {
    super(table_stock_warehouse);
  }

  getViewDataList = async (
    params: ListParamsRequest = {}
  ): Promise<ListParamsResponse<WarehouseViewRow>> => {
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
  };
}

export default ListWarehouseModel;

