import { ilike } from "drizzle-orm";
import type { Column } from "drizzle-orm";

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
    super({
      table: table_stock_warehouse,
      sortDefault: [
        {
          column: "name",
          direction: "ascending",
        },
      ],
    });
  }

  protected declarationColumns() {
    return new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: table_stock_warehouse.id, sort: true }],
      ["code", { column: table_stock_warehouse.code, sort: true }],
      ["name", { column: table_stock_warehouse.name, sort: true }],
      [
        "typeCode",
        { column: table_stock_warehouse.typeCode, sort: true },
      ],
      ["status", { column: table_stock_warehouse.status, sort: true }],
      [
        "companyId",
        { column: table_stock_warehouse.companyId, sort: true },
      ],
      [
        "managerId",
        { column: table_stock_warehouse.managerId, sort: true },
      ],
      [
        "contactId",
        { column: table_stock_warehouse.contactId, sort: true },
      ],
      [
        "address",
        { column: table_stock_warehouse.address, sort: false },
      ],
      [
        "valuationMethod",
        { column: table_stock_warehouse.valuationMethod, sort: true },
      ],
      [
        "minStock",
        { column: table_stock_warehouse.minStock, sort: true },
      ],
      [
        "maxStock",
        { column: table_stock_warehouse.maxStock, sort: true },
      ],
      [
        "accountInventory",
        { column: table_stock_warehouse.accountInventory, sort: false },
      ],
      [
        "accountAdjustment",
        { column: table_stock_warehouse.accountAdjustment, sort: false },
      ],
      ["notes", { column: table_stock_warehouse.notes, sort: false }],
      [
        "createdAt",
        { column: table_stock_warehouse.createdAt, sort: true },
      ],
      [
        "updatedAt",
        { column: table_stock_warehouse.updatedAt, sort: true },
      ],
    ]);
  }

  protected declarationSearch() {
    return [
      (text: string) => ilike(table_stock_warehouse.code, text),
      (text: string) => ilike(table_stock_warehouse.name, text),
      (text: string) => ilike(table_stock_warehouse.typeCode, text),
      (text: string) => ilike(table_stock_warehouse.status, text),
    ];
  }

  protected declarationFilter() {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(row: any): WarehouseViewRow {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      typeCode: row.typeCode,
      status: row.status,
      companyId: row.companyId ?? null,
      managerId: row.managerId ?? null,
      contactId: row.contactId ?? null,
      address: row.address as WarehouseAddress,
      valuationMethod: row.valuationMethod,
      minStock: Number(row.minStock ?? 0),
      maxStock:
        row.maxStock === null || row.maxStock === undefined
          ? null
          : Number(row.maxStock),
      accountInventory: row.accountInventory ?? null,
      accountAdjustment: row.accountAdjustment ?? null,
      notes: row.notes ?? null,
      createdAt: row.createdAt ? row.createdAt.toISOString() : null,
      updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
    };
  }

  getData = async (
    params: ListParamsRequest = {}
  ): Promise<ListParamsResponse<WarehouseViewRow>> => {
    return this.buildQueryDataList(params);
  };
}

export default ListWarehouseModel;

