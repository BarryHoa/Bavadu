import type { Column } from "drizzle-orm";
import { and, eq, ilike, sql } from "drizzle-orm";

import { ParamFilter } from "@base/server";
import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";

import { product_tb_product_masters } from "@mdl/product/server/schemas/product.master";
import { stock_tb_stock_levels, stock_tb_stock_warehouses } from "../../schemas";

export interface StockSummaryViewRow {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  minStock: number | null;
}

interface StockSummaryFilter extends ParamFilter {
  productId?: string;
  warehouseId?: string;
}

class StockSummaryViewListModel extends BaseViewListModel<
  typeof stock_tb_stock_levels,
  StockSummaryViewRow,
  StockSummaryFilter
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      [
        "productId",
        {
          column: stock_tb_stock_levels.productId,
          sort: true,
        },
      ],
      [
        "productCode",
        {
          column: product_tb_product_masters.code,
          sort: true,
        },
      ],
      [
        "productName",
        {
          column: product_tb_product_masters.name,
          sort: true,
        },
      ],
      [
        "warehouseId",
        {
          column: stock_tb_stock_levels.warehouseId,
          sort: true,
        },
      ],
      [
        "warehouseCode",
        {
          column: stock_tb_stock_warehouses.code,
          sort: true,
        },
      ],
      [
        "warehouseName",
        {
          column: stock_tb_stock_warehouses.name,
          sort: true,
        },
      ],
      [
        "quantity",
        {
          column: stock_tb_stock_levels.quantity,
          sort: true,
        },
      ],
      [
        "reservedQuantity",
        {
          column: stock_tb_stock_levels.reservedQuantity,
          sort: true,
        },
      ],
      [
        "minStock",
        {
          column: stock_tb_stock_warehouses.minStock,
          sort: true,
        },
      ],
    ]);

  constructor() {
    super({
      table: stock_tb_stock_levels,
      sortDefault: [
        {
          column: "productId",
          direction: "ascending",
        },
      ],
    });
  }

  protected declarationSearch = () =>
    new Map([
      ["productId", (text: string) => ilike(stock_tb_stock_levels.productId, text)],
      ["productCode", (text: string) => ilike(product_tb_product_masters.code, text)],
      ["productName", (text: string) => ilike(sql`${product_tb_product_masters.name}::text`, text)],
      ["warehouseId", (text: string) => ilike(stock_tb_stock_levels.warehouseId, text)],
      ["warehouseCode", (text: string) => ilike(stock_tb_stock_warehouses.code, text)],
      ["warehouseName", (text: string) => ilike(stock_tb_stock_warehouses.name, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<StockSummaryFilter> =>
    new Map([
      [
        "productId",
        (value?: unknown, _filters?: StockSummaryFilter) => {
          if (typeof value !== "string" || !value) return undefined;
          return eq(stock_tb_stock_levels.productId, value);
        },
      ],
      [
        "warehouseId",
        (value?: unknown, _filters?: StockSummaryFilter) => {
          if (typeof value !== "string" || !value) return undefined;
          return eq(stock_tb_stock_levels.warehouseId, value);
        },
      ],
    ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): StockSummaryViewRow => ({
    id: `${row.productId}-${row.warehouseId}`,
    productId: row.productId,
    productCode: row.productCode || row.productId,
    productName:
      typeof row.productName === "string"
        ? row.productName
        : row.productName?.en || row.productName?.vi || row.productId,
    warehouseId: row.warehouseId,
    warehouseCode: row.warehouseCode || row.warehouseId,
    warehouseName: row.warehouseName || row.warehouseId,
    quantity: Number(row.quantity),
    reservedQuantity: Number(row.reservedQuantity),
    minStock: row.minStock ? Number(row.minStock) : null,
  });

  getData = async (
    params: ListParamsRequest<StockSummaryFilter> = {}
  ): Promise<ListParamsResponse<StockSummaryViewRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query
        .leftJoin(
          product_tb_product_masters,
          eq(stock_tb_stock_levels.productId, product_tb_product_masters.id)
        )
        .leftJoin(
          stock_tb_stock_warehouses,
          eq(stock_tb_stock_levels.warehouseId, stock_tb_stock_warehouses.id)
        )
    );
  };
}

export default StockSummaryViewListModel;
