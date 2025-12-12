import { ilike } from "drizzle-orm";
import type { Column } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { ParamFilter } from "@base/server/models/interfaces/FilterInterface";

import {
  WarehouseAddress,
} from "../../../common/constants";
import type { StockTbStockWarehouse } from "../../schemas";
import { stock_tb_stock_warehouses } from "../../schemas";

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

class WarehouseViewListModel extends BaseViewListModel<
  typeof stock_tb_stock_warehouses,
  WarehouseViewRow
> {
  constructor() {
    super({
      table: stock_tb_stock_warehouses,
      sortDefault: [
        {
          column: "name",
          direction: "ascending",
        },
      ],
    });
  }

  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: stock_tb_stock_warehouses.id, sort: true }],
      ["code", { column: stock_tb_stock_warehouses.code, sort: true }],
      ["name", { column: stock_tb_stock_warehouses.name, sort: true }],
      [
        "typeCode",
        { column: stock_tb_stock_warehouses.typeCode, sort: true },
      ],
      ["status", { column: stock_tb_stock_warehouses.status, sort: true }],
      [
        "companyId",
        { column: stock_tb_stock_warehouses.companyId, sort: true },
      ],
      [
        "managerId",
        { column: stock_tb_stock_warehouses.managerId, sort: true },
      ],
      [
        "contactId",
        { column: stock_tb_stock_warehouses.contactId, sort: true },
      ],
      [
        "address",
        { column: stock_tb_stock_warehouses.address, sort: false },
      ],
      [
        "valuationMethod",
        { column: stock_tb_stock_warehouses.valuationMethod, sort: true },
      ],
      [
        "minStock",
        { column: stock_tb_stock_warehouses.minStock, sort: true },
      ],
      [
        "maxStock",
        { column: stock_tb_stock_warehouses.maxStock, sort: true },
      ],
      [
        "accountInventory",
        { column: stock_tb_stock_warehouses.accountInventory, sort: false },
      ],
      [
        "accountAdjustment",
        { column: stock_tb_stock_warehouses.accountAdjustment, sort: false },
      ],
      ["notes", { column: stock_tb_stock_warehouses.notes, sort: false }],
      [
        "createdAt",
        { column: stock_tb_stock_warehouses.createdAt, sort: true },
      ],
      [
        "updatedAt",
        { column: stock_tb_stock_warehouses.updatedAt, sort: true },
      ],
    ]);

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(stock_tb_stock_warehouses.code, text)],
      ["name", (text: string) => ilike(stock_tb_stock_warehouses.name, text)],
      ["typeCode", (text: string) => ilike(stock_tb_stock_warehouses.typeCode, text)],
      ["status", (text: string) => ilike(stock_tb_stock_warehouses.status, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): WarehouseViewRow => ({
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
  });

  getData = async (
    params: ListParamsRequest = {}
  ): Promise<ListParamsResponse<WarehouseViewRow>> => {
    return this.buildQueryDataList(params);
  };
}

export default WarehouseViewListModel;

